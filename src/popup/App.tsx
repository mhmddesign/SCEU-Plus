import { useEffect } from 'react';
import { Header } from './components/Header';
import { TextRandomizerCard } from './components/TextRandomizerCard';
import { UnicodeWarningCard } from './components/UnicodeWarningCard';
import { useSettingsStore } from '@/stores/settingsStore';

function App() {
    const { settings, isLoading, loadSettings } = useSettingsStore();

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;

        if (settings.theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
        } else {
            root.classList.toggle('dark', settings.theme === 'dark');
        }
    }, [settings.theme]);

    if (isLoading) {
        return (
            <div className="popup-container flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="popup-container p-4">
            <Header />

            <main className="space-y-3">
                <TextRandomizerCard />
                <UnicodeWarningCard />
            </main>

            <footer className="mt-4 pt-3 border-t text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                    SCEU+ v1.0.0 • <kbd className="px-1 bg-muted rounded">Esc</kbd> to pause
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                    by <a href="https://x.com/Mohelmaachi" target="_blank" rel="noopener" className="hover:text-primary">@Mohelmaachi</a> • fork of <a href="https://github.com/ThioJoe/Simple-Chrome-Extension-Utilities" target="_blank" rel="noopener" className="hover:text-primary">ThioJoe</a>
                </p>
            </footer>
        </div>
    );
}

export default App;
