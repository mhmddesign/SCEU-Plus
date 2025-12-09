import { ShieldAlert, ListChecks, History } from 'lucide-react';
import { ModuleCard } from './ModuleCard';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';

export function UnicodeWarningCard() {
    const { settings, updateUnicodeWarning } = useSettingsStore();
    const { unicodeWarning } = settings;

    const openOptions = () => {
        chrome.runtime.openOptionsPage();
    };

    return (
        <ModuleCard
            title="Unicode Warning"
            description="Detect IDN phishing domains"
            icon={<ShieldAlert className="h-4 w-4" />}
            enabled={unicodeWarning.enabled}
            onToggle={(enabled) => updateUnicodeWarning({ enabled })}
            accentColor="bg-amber-500"
        >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">
                        {unicodeWarning.whitelist.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Whitelisted</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">
                        {unicodeWarning.allowedChars.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Allowed Chars</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={openOptions}
                >
                    <ListChecks className="h-3 w-3 mr-1" />
                    Manage Whitelist
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={openOptions}
                >
                    <History className="h-3 w-3 mr-1" />
                    View History
                </Button>
            </div>

            {/* Info */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-xs text-amber-700 dark:text-amber-400">
                <p className="font-medium">🛡️ Protection Active</p>
                <p className="text-amber-600 dark:text-amber-500">
                    You'll be warned when visiting domains with unicode characters that could be used for phishing.
                </p>
            </div>
        </ModuleCard>
    );
}
