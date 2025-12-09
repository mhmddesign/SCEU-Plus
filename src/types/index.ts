/**
 * Shared TypeScript interfaces for Chrome Extension Suite
 * Used across background, popup, options, and content scripts
 */

/** Settings for the Text Randomizer module */
export interface ITextRandomizerSettings {
    enabled: boolean;
    blurEnabled: boolean;
    blurIntensity: number; // 1-20px
    regexPattern: string;
    regexEnabled: boolean;
    fakeDataType: 'random' | 'lorem' | 'names' | 'addresses';
}

/** Settings for the Unicode Warning module */
export interface IUnicodeWarningSettings {
    enabled: boolean;
    whitelist: string[];
    whitelistMetadata: Record<string, IWhitelistEntry>;
    allowedChars: string;
}

/** Metadata for a whitelisted domain */
export interface IWhitelistEntry {
    added: string; // ISO date string
    title: string;
    notes?: string;
}

/** Log entry for Unicode Warning history */
export interface IWarningLogEntry {
    id: string;
    timestamp: string;
    domain: string;
    unicodeDomain: string;
    action: 'blocked' | 'proceeded' | 'whitelisted';
}

/** Global extension settings */
export interface ISettings {
    theme: 'light' | 'dark' | 'system';
    textRandomizer: ITextRandomizerSettings;
    unicodeWarning: IUnicodeWarningSettings;
}

/** Default settings */
export const DEFAULT_SETTINGS: ISettings = {
    theme: 'system',
    textRandomizer: {
        enabled: false,
        blurEnabled: false,
        blurIntensity: 4,
        regexPattern: '',
        regexEnabled: false,
        fakeDataType: 'random',
    },
    unicodeWarning: {
        enabled: true,
        whitelist: [],
        whitelistMetadata: {},
        allowedChars: '',
    },
};

/** Message types for communication between scripts */
export type MessageAction =
    | { type: 'ACTIVATE_RANDOMIZER' }
    | { type: 'DEACTIVATE_RANDOMIZER' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<ISettings> }
    | { type: 'GET_SETTINGS' }
    | { type: 'LOG_WARNING'; payload: Omit<IWarningLogEntry, 'id' | 'timestamp'> }
    | { type: 'ELEMENT_PICKER_START' }
    | { type: 'ELEMENT_PICKER_CANCEL' }
    | { type: 'ELEMENT_PICKER_SELECT'; payload: { selector: string } };

/** Response wrapper for messages */
export interface MessageResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
