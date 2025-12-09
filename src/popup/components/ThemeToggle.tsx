import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeToggle() {
    const { settings, setTheme } = useSettingsStore();
    const { theme } = settings;

    const cycleTheme = () => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
    };

    const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
    const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="relative"
            title={`Theme: ${label}`}
        >
            <Icon className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
