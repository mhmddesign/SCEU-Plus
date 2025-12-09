/**
 * Text Randomizer Content Script
 * Injects into pages and handles text randomization, blur, and element picking
 * Uses Shadow DOM for CSS isolation when injecting UI elements
 */

import type { ITextRandomizerSettings } from '@/types';
import { generateFakeData } from '@/lib/fakeData';

// Prevent double injection
if (typeof window.__textRandomizerInjected === 'undefined') {
    window.__textRandomizerInjected = true;

    // State tracking attributes
    const MODIFIED_ATTR = 'data-randomizer-modified';
    const SPAN_WRAPPER_ATTR = 'data-randomizer-span';
    const BLUR_AMOUNT_ATTR = 'data-randomizer-blur-amount';

    // State
    let isActive = false;
    let settings: ITextRandomizerSettings | null = null;
    const historyStack: HistoryEntry[] = [];

    // Paused state - stores modified elements' randomized content for resume
    interface PausedElementState {
        element: HTMLElement;
        kind: 'input' | 'element';
        modifiedHTML?: string;
        modifiedValue?: string;
        originalHTML?: string;
        originalValue?: string;
        blurAmount?: number;
    }
    const pausedElements: PausedElementState[] = [];

    interface HistoryEntry {
        element: HTMLElement;
        kind: 'input' | 'element';
        beforeHTML?: string;
        beforeValue?: string;
    }

    // Initialize
    init();

    async function init() {
        // Load initial settings
        await reloadSettings();

        if (settings?.enabled) {
            activate();
        }

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
            if (message.type === 'ACTIVATE_RANDOMIZER') {
                reloadSettings().then(() => activate());
                sendResponse({ success: true });
            } else if (message.type === 'DEACTIVATE_RANDOMIZER') {
                deactivate();
                sendResponse({ success: true });
            } else if (message.type === 'UPDATE_SETTINGS') {
                // Reload settings when popup updates them
                reloadSettings();
                sendResponse({ success: true });
            }
            return true;
        });

        // Listen for storage changes (in case settings change from options page)
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync' && changes.settings?.newValue?.textRandomizer) {
                settings = changes.settings.newValue.textRandomizer;
                console.log('[Text Randomizer] Settings updated:', settings);
            }
        });
    }

    async function reloadSettings() {
        try {
            const result = await chrome.storage.sync.get('settings');
            settings = result.settings?.textRandomizer || null;
            console.log('[Text Randomizer] Settings loaded:', settings);
        } catch (error) {
            console.error('[Text Randomizer] Failed to load settings:', error);
        }
    }

    function activate() {
        if (isActive) return;
        isActive = true;

        document.addEventListener('click', handleInteraction, true);
        document.addEventListener('keydown', handleKeyDown, true);

        // Restore paused modifications if any
        if (pausedElements.length > 0) {
            restoreModifications();
            showToast('Text Randomizer resumed');
        } else {
            showToast('Text Randomizer activated');
        }

        console.log('[Text Randomizer] Activated. Press Esc to deactivate.');
    }

    function deactivate() {
        if (!isActive) return;
        isActive = false;

        document.removeEventListener('click', handleInteraction, true);
        document.removeEventListener('keydown', handleKeyDown, true);

        // Store current modifications and show originals
        hideModifications();

        console.log('[Text Randomizer] Deactivated (paused).');
        showToast('Text Randomizer paused');
    }

    function hideModifications() {
        // Find all modified elements and store their state
        const modifiedElements = document.querySelectorAll(`[${MODIFIED_ATTR}]`);

        modifiedElements.forEach(el => {
            const element = el as HTMLElement;
            const isInputButton = element.tagName === 'INPUT' &&
                ['button', 'submit', 'reset'].includes((element as HTMLInputElement).type);
            const blurAmount = parseInt(element.getAttribute(BLUR_AMOUNT_ATTR) || '0', 10);

            // Find the original state from history
            const historyEntry = [...historyStack].reverse().find(h => h.element === element);

            if (isInputButton) {
                const input = element as HTMLInputElement;
                pausedElements.push({
                    element,
                    kind: 'input',
                    modifiedValue: input.value,
                    originalValue: historyEntry?.beforeValue || input.value,
                    blurAmount,
                });
                // Restore original
                if (historyEntry?.beforeValue) {
                    input.value = historyEntry.beforeValue;
                }
            } else {
                pausedElements.push({
                    element,
                    kind: 'element',
                    modifiedHTML: element.innerHTML,
                    originalHTML: historyEntry?.beforeHTML || element.innerHTML,
                    blurAmount,
                });
                // Restore original
                if (historyEntry?.beforeHTML) {
                    element.innerHTML = historyEntry.beforeHTML;
                }
            }

            // Remove visual indicators
            element.removeAttribute(MODIFIED_ATTR);
            removeBlur(element, isInputButton);
        });
    }

    function restoreModifications() {
        // Restore all paused modifications
        pausedElements.forEach(state => {
            const { element, kind, modifiedHTML, modifiedValue, blurAmount } = state;

            if (kind === 'input') {
                (element as HTMLInputElement).value = modifiedValue || '';
            } else {
                element.innerHTML = modifiedHTML || '';
            }

            element.setAttribute(MODIFIED_ATTR, 'true');

            // Restore blur if it was applied
            if (blurAmount && blurAmount > 0) {
                applyBlur(element, blurAmount, kind === 'input');
            }
        });

        // Clear paused elements (they're now active again)
        pausedElements.length = 0;
    }

    function handleInteraction(event: MouseEvent) {
        const { altKey, ctrlKey } = event;

        // Only proceed if Ctrl or Alt key was held
        if (!altKey && !ctrlKey) return;

        // Find previously modified element or use direct target
        const targetElement = (event.target as Element).closest(`[${MODIFIED_ATTR}]`) as HTMLElement
            || event.target as HTMLElement;

        // Check for different types of elements
        const isInputButton = targetElement.tagName === 'INPUT' &&
            ['button', 'submit', 'reset'].includes((targetElement as HTMLInputElement).type);
        const hasTextContent = targetElement.textContent?.trim().length ?? 0 > 0;
        const hasInputValue = isInputButton && (targetElement as HTMLInputElement).value.trim().length > 0;
        const isModified = targetElement.hasAttribute(MODIFIED_ATTR);

        // Valid target check
        if (!hasTextContent && !hasInputValue && !isModified) return;

        event.preventDefault();
        event.stopPropagation();

        if (ctrlKey && altKey) {
            // Ctrl + Alt: Clear text
            clearText(targetElement, isInputButton);
        } else if (ctrlKey) {
            // Ctrl only: Increase blur
            if (isModified) {
                increaseBlur(targetElement, isInputButton);
            }
        } else if (altKey) {
            // Alt only: Randomize text
            randomizeText(targetElement, isInputButton);
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            deactivate();
            // Notify background
            chrome.runtime.sendMessage({ type: 'DEACTIVATE_RANDOMIZER' }).catch(() => { });
        } else if (event.ctrlKey && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            undoLastAction();
        }
    }

    function saveState(element: HTMLElement) {
        const isInputButton = element.tagName === 'INPUT' &&
            ['button', 'submit', 'reset'].includes((element as HTMLInputElement).type);

        if (isInputButton) {
            historyStack.push({
                element,
                kind: 'input',
                beforeValue: (element as HTMLInputElement).value,
            });
        } else {
            historyStack.push({
                element,
                kind: 'element',
                beforeHTML: element.innerHTML,
            });
        }
    }

    function randomizeText(element: HTMLElement, isInputButton: boolean) {
        saveState(element);
        removeBlur(element, isInputButton);

        const fakeDataType = settings?.fakeDataType || 'random';
        const regexEnabled = settings?.regexEnabled || false;
        const regexPattern = settings?.regexPattern || '';

        if (isInputButton) {
            const input = element as HTMLInputElement;
            const originalLength = input.value.trim().length;
            input.value = generateFakeData(originalLength, fakeDataType);
        } else {
            const isModified = element.hasAttribute(MODIFIED_ATTR);

            if (!isModified) {
                wrapAndModifyText(element, fakeDataType, regexEnabled ? regexPattern : '');
            } else {
                // Update existing spans
                const spans = element.querySelectorAll(`[${SPAN_WRAPPER_ATTR}]`);
                spans.forEach(span => {
                    const len = span.textContent?.length || 0;
                    span.textContent = generateFakeData(len, fakeDataType);
                });
            }
        }

        element.setAttribute(MODIFIED_ATTR, 'true');
        showVisualFeedback(element, 'randomized');

        // Apply blur if enabled
        if (settings?.blurEnabled) {
            setTimeout(() => {
                applyBlur(element, settings?.blurIntensity || 4, isInputButton);
            }, 200);
        }
    }

    function wrapAndModifyText(
        element: HTMLElement,
        fakeDataType: 'random' | 'lorem' | 'names' | 'addresses',
        regexPattern: string
    ) {
        const regex = regexPattern ? new RegExp(regexPattern) : null;

        function processNode(node: Node) {
            const childNodes = Array.from(node.childNodes);

            childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
                    const text = child.nodeValue;

                    // If regex is set, only modify matching text
                    if (regex && !regex.test(text)) {
                        return;
                    }

                    const span = document.createElement('span');
                    span.setAttribute(SPAN_WRAPPER_ATTR, 'true');
                    span.textContent = generateFakeData(text.trim().length, fakeDataType);
                    child.parentNode?.replaceChild(span, child);
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const el = child as Element;
                    if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                        processNode(child);
                    }
                }
            });
        }

        processNode(element);
    }

    function clearText(element: HTMLElement, isInputButton: boolean) {
        saveState(element);

        if (isInputButton) {
            const input = element as HTMLInputElement;
            const len = input.value.trim().length;
            input.value = '\u00A0'.repeat(len);
        } else {
            const isModified = element.hasAttribute(MODIFIED_ATTR);

            if (isModified) {
                const spans = element.querySelectorAll(`[${SPAN_WRAPPER_ATTR}]`);
                spans.forEach(span => {
                    const len = span.textContent?.length || 0;
                    span.textContent = '\u00A0'.repeat(len);
                });
            } else {
                clearTextNodes(element);
            }
        }

        removeBlur(element, isInputButton);
        element.removeAttribute(MODIFIED_ATTR);
        showVisualFeedback(element, 'cleared');
    }

    function clearTextNodes(element: HTMLElement) {
        const childNodes = Array.from(element.childNodes);

        childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
                const len = child.nodeValue.trim().length;
                child.nodeValue = '\u00A0'.repeat(len);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as Element;
                if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                    clearTextNodes(child as HTMLElement);
                }
            }
        });
    }

    function increaseBlur(element: HTMLElement, isInputButton: boolean) {
        const currentBlur = parseInt(element.getAttribute(BLUR_AMOUNT_ATTR) || '0', 10);
        const maxBlur = 20;

        let newBlur = currentBlur === 0 ? (settings?.blurIntensity || 4) : currentBlur + 2;
        if (newBlur > maxBlur) newBlur = maxBlur;

        removeBlur(element, isInputButton);
        applyBlur(element, newBlur, isInputButton, true);
    }

    function applyBlur(element: HTMLElement, blurAmount: number, isInputButton: boolean, instant = false) {
        const transition = instant ? 'none' : 'filter 0.3s ease-in';

        if (isInputButton) {
            const computed = window.getComputedStyle(element);
            const originalColor = computed.color;
            element.style.transition = instant ? 'none' : 'color 0.3s ease-in, text-shadow 0.3s ease-in';
            element.style.color = 'transparent';
            element.style.textShadow = `0 0 ${blurAmount}px ${originalColor}`;
        } else {
            const spans = element.querySelectorAll(`[${SPAN_WRAPPER_ATTR}]`);
            spans.forEach(span => {
                (span as HTMLElement).style.transition = transition;
                (span as HTMLElement).style.filter = `blur(${blurAmount}px)`;
            });
        }

        element.setAttribute(BLUR_AMOUNT_ATTR, blurAmount.toString());

        if (instant) {
            showBlurTooltip(element, blurAmount);
        }
    }

    function removeBlur(element: HTMLElement, isInputButton: boolean) {
        if (isInputButton) {
            element.style.transition = 'none';
            element.style.color = '';
            element.style.textShadow = '';
        } else {
            const spans = element.querySelectorAll(`[${SPAN_WRAPPER_ATTR}]`);
            spans.forEach(span => {
                (span as HTMLElement).style.transition = 'none';
                (span as HTMLElement).style.filter = '';
            });
        }
        element.removeAttribute(BLUR_AMOUNT_ATTR);
    }

    function undoLastAction() {
        if (historyStack.length === 0) {
            showToast('Nothing to undo');
            return;
        }

        const lastAction = historyStack.pop()!;
        const { element, kind, beforeHTML, beforeValue } = lastAction;

        if (kind === 'input') {
            (element as HTMLInputElement).value = beforeValue || '';
        } else {
            element.innerHTML = beforeHTML || '';
        }

        element.removeAttribute(MODIFIED_ATTR);
        removeBlur(element, kind === 'input');
        showVisualFeedback(element, 'undone');
    }

    function showVisualFeedback(element: HTMLElement, type: 'randomized' | 'cleared' | 'undone') {
        const colors = {
            randomized: '2px dashed #ef4444',
            cleared: '2px dashed #f59e0b',
            undone: '2px dashed #22c55e',
        };

        element.style.outline = colors[type];
        setTimeout(() => {
            element.style.outline = '';
        }, 500);
    }

    function showBlurTooltip(element: HTMLElement, blurAmount: number) {
        // Remove existing tooltip
        document.querySelector('.randomizer-blur-tooltip')?.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'randomizer-blur-tooltip';
        tooltip.textContent = `Blur: ${blurAmount}px`;
        Object.assign(tooltip.style, {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: '999999',
            pointerEvents: 'none',
            fontFamily: 'sans-serif',
        });

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;

        setTimeout(() => {
            tooltip.remove();
        }, 750);
    }

    function showToast(message: string) {
        // Remove existing toast
        document.querySelector('.randomizer-toast')?.remove();

        const toast = document.createElement('div');
        toast.className = 'randomizer-toast';
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '999999',
            pointerEvents: 'none',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }
}

// TypeScript declaration for window augmentation
declare global {
    interface Window {
        __textRandomizerInjected?: boolean;
    }
}

export { };
