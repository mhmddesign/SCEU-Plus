import { create } from 'zustand';
import type { ISettings, ITextRandomizerSettings, IUnicodeWarningSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

interface SettingsStore {
    settings: ISettings;
    isLoading: boolean;

    // Actions
    loadSettings: () => Promise<void>;
    updateTextRandomizer: (updates: Partial<ITextRandomizerSettings>) => Promise<void>;
    updateUnicodeWarning: (updates: Partial<IUnicodeWarningSettings>) => Promise<void>;
    setTheme: (theme: ISettings['theme']) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    isLoading: true,

    loadSettings: async () => {
        try {
            const result = await chrome.storage.sync.get('settings');
            const settings = result.settings || DEFAULT_SETTINGS;
            set({ settings, isLoading: false });
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isLoading: false });
        }
    },

    updateTextRandomizer: async (updates) => {
        const { settings } = get();
        const newSettings: ISettings = {
            ...settings,
            textRandomizer: { ...settings.textRandomizer, ...updates },
        };

        set({ settings: newSettings });
        await chrome.storage.sync.set({ settings: newSettings });

        // Notify content scripts about the change
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            // Send activation/deactivation message if enabled changed
            if ('enabled' in updates) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: updates.enabled ? 'ACTIVATE_RANDOMIZER' : 'DEACTIVATE_RANDOMIZER',
                }).catch(() => {
                    // Content script may not be loaded yet
                });
            } else {
                // Send update message for other settings changes
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'UPDATE_SETTINGS',
                }).catch(() => {
                    // Content script may not be loaded yet
                });
            }
        }
    },

    updateUnicodeWarning: async (updates) => {
        const { settings } = get();
        const newSettings: ISettings = {
            ...settings,
            unicodeWarning: { ...settings.unicodeWarning, ...updates },
        };

        set({ settings: newSettings });
        await chrome.storage.sync.set({ settings: newSettings });
    },

    setTheme: async (theme) => {
        const { settings } = get();
        const newSettings: ISettings = { ...settings, theme };

        set({ settings: newSettings });
        await chrome.storage.sync.set({ settings: newSettings });
    },
}));
