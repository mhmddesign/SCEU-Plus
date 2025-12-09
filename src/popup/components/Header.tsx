import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
    const openOptions = () => {
        chrome.runtime.openOptionsPage();
    };

    return (
        <header className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-sm font-bold text-white">ES</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight">Extension Suite</h1>
                    <p className="text-xs text-muted-foreground">Control Center</p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={openOptions}
                    title="Open Settings"
                >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </Button>
            </div>
        </header>
    );
}
