/**
 * Background Service Worker
 * Handles message passing between popup, options, and content scripts
 */

import type { MessageAction, MessageResponse } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
    const existing = await chrome.storage.sync.get('settings');
    if (!existing.settings) {
        await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
    console.log('Extension Suite installed/updated');
});

// Message handler for cross-context communication
chrome.runtime.onMessage.addListener(
    (message: MessageAction, _sender, sendResponse: (response: MessageResponse) => void) => {
        handleMessage(message).then(sendResponse);
        return true; // Keep channel open for async response
    }
);

async function handleMessage(message: MessageAction): Promise<MessageResponse> {
    try {
        switch (message.type) {
            case 'GET_SETTINGS': {
                const data = await chrome.storage.sync.get('settings');
                return { success: true, data: data.settings };
            }

            case 'UPDATE_SETTINGS': {
                const current = await chrome.storage.sync.get('settings');
                const updated = { ...current.settings, ...message.payload };
                await chrome.storage.sync.set({ settings: updated });
                return { success: true, data: updated };
            }

            case 'LOG_WARNING': {
                const logs = (await chrome.storage.local.get('warningLogs')).warningLogs || [];
                const newLog = {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    ...message.payload,
                };
                logs.unshift(newLog);
                // Keep only last 100 entries
                await chrome.storage.local.set({ warningLogs: logs.slice(0, 100) });
                return { success: true, data: newLog };
            }

            default:
                return { success: false, error: 'Unknown message type' };
        }
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export { };
