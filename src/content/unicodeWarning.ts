/**
 * Unicode Warning Content Script
 * Detects IDN/Punycode domains and redirects to warning page
 * Runs at document_start for early interception
 */

import type { IUnicodeWarningSettings } from '@/types';

// Only run on top-level frames
if (window.self === window.top) {
    const hostname = window.location.hostname;

    // Skip localhost and empty hostnames
    if (hostname && hostname.toLowerCase() !== 'localhost') {

        // Check for IDN (non-ASCII characters or xn-- punycode prefix)
        const isIDN = /[^\u0000-\u007f]/.test(hostname) || hostname.toLowerCase().includes('xn--');

        if (isIDN) {
            console.log('[Extension Suite] IDN detected:', hostname);

            // Check settings and whitelists
            checkAndWarn(hostname);
        }
    }
}

async function checkAndWarn(hostname: string) {
    try {
        // Get settings from storage
        const result = await chrome.storage.sync.get('settings');
        const settings = result.settings;

        // If no settings or unicode warning is disabled, skip
        if (!settings?.unicodeWarning?.enabled) {
            console.log('[Extension Suite] Unicode Warning disabled, skipping');
            return;
        }

        const { whitelist, allowedChars } = settings.unicodeWarning as IUnicodeWarningSettings;

        // A. Check permanent whitelist
        if (whitelist && whitelist.includes(hostname)) {
            console.log('[Extension Suite] Domain is whitelisted:', hostname);
            return;
        }

        // B. Check allowed characters
        if (allowedChars && allowedChars.length > 0) {
            // Convert punycode to unicode for checking
            const unicodeHostname = punycodeToUnicode(hostname);

            const isAllowed = [...unicodeHostname].every(char => {
                return char.codePointAt(0)! <= 127 || allowedChars.includes(char);
            });

            if (isAllowed) {
                console.log('[Extension Suite] All unicode chars are allowed:', unicodeHostname);
                return;
            }
        }

        // C. Check temporary dismissals (session-based)
        const localData = await chrome.storage.local.get(['tempDismissed', 'sessionToken']);
        const warningPageUrl = chrome.runtime.getURL('src/warning/index.html');
        const currentSessionToken = warningPageUrl;

        let dismissed = localData.tempDismissed || [];
        const storedToken = localData.sessionToken;

        // If tokens don't match, browser was restarted - clear session dismissals
        if (storedToken !== currentSessionToken) {
            dismissed = [];
        }

        // If this domain was temporarily dismissed this session, skip
        if (dismissed.includes(hostname)) {
            console.log('[Extension Suite] Domain temporarily dismissed:', hostname);
            return;
        }

        // D. Redirect to warning page
        console.log('[Extension Suite] Redirecting to warning page for:', hostname);
        const targetUrl = encodeURIComponent(window.location.href);
        window.location.replace(`${warningPageUrl}?target=${targetUrl}`);

    } catch (error) {
        console.error('[Extension Suite] Error in Unicode Warning:', error);
    }
}

/**
 * Simple punycode to unicode converter
 * Handles xn-- prefixed domains
 */
function punycodeToUnicode(hostname: string): string {
    try {
        // Use the URL API which auto-converts punycode
        const url = new URL(`http://${hostname}`);
        return url.hostname;
    } catch {
        return hostname;
    }
}

// TypeScript declaration for window augmentation
declare global {
    interface Window {
        __unicodeWarningInjected?: boolean;
    }
}

export { };
