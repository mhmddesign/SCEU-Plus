import { useEffect, useState } from 'react';
import { Trash2, ExternalLink, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ISettings, IWarningLogEntry } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

function App() {
    const [settings, setSettings] = useState<ISettings>(DEFAULT_SETTINGS);
    const [warningLogs, setWarningLogs] = useState<IWarningLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Apply dark mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);

        // Load settings and logs
        loadData();
    }, []);

    async function loadData() {
        try {
            const [syncResult, localResult] = await Promise.all([
                chrome.storage.sync.get('settings'),
                chrome.storage.local.get('warningLogs'),
            ]);

            setSettings(syncResult.settings || DEFAULT_SETTINGS);
            setWarningLogs(localResult.warningLogs || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load data:', error);
            setIsLoading(false);
        }
    }

    async function removeFromWhitelist(domain: string) {
        const newWhitelist = settings.unicodeWarning.whitelist.filter(d => d !== domain);
        const newMetadata = { ...settings.unicodeWarning.whitelistMetadata };
        delete newMetadata[domain];

        const newSettings: ISettings = {
            ...settings,
            unicodeWarning: {
                ...settings.unicodeWarning,
                whitelist: newWhitelist,
                whitelistMetadata: newMetadata,
            },
        };

        setSettings(newSettings);
        await chrome.storage.sync.set({ settings: newSettings });
    }

    async function clearHistory() {
        setWarningLogs([]);
        await chrome.storage.local.set({ warningLogs: [] });
    }

    async function updateAllowedChars(chars: string) {
        // Remove whitespace and deduplicate
        const cleaned = [...new Set(chars.replace(/\s/g, ''))].join('');

        const newSettings: ISettings = {
            ...settings,
            unicodeWarning: {
                ...settings.unicodeWarning,
                allowedChars: cleaned,
            },
        };

        setSettings(newSettings);
        await chrome.storage.sync.set({ settings: newSettings });
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <span className="text-lg font-bold text-white">ES</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Extension Suite Options</h1>
                        <p className="text-muted-foreground text-sm">Manage settings and view history</p>
                    </div>
                </header>

                {/* Whitelist Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Trusted Domains (Whitelist)
                        </CardTitle>
                        <CardDescription>
                            Domains that won't trigger the Unicode Warning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {settings.unicodeWarning.whitelist.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-4 text-center">
                                No whitelisted domains yet. They'll appear here when you trust a domain from the warning page.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {settings.unicodeWarning.whitelist.map(domain => {
                                    const meta = settings.unicodeWarning.whitelistMetadata[domain];
                                    return (
                                        <div
                                            key={domain}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <a
                                                    href={`http://${domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-sm hover:text-primary flex items-center gap-1"
                                                >
                                                    {domain}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                                {meta?.added && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Added: {meta.added}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromWhitelist(domain)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Allowed Characters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Allowed Unicode Characters</CardTitle>
                        <CardDescription>
                            Characters that won't trigger warnings (e.g., é ñ ü for French/Spanish/German)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={settings.unicodeWarning.allowedChars}
                                onChange={(e) => updateAllowedChars(e.target.value)}
                                placeholder="Type allowed characters here..."
                                className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-lg tracking-wider"
                            />
                            {settings.unicodeWarning.allowedChars && (
                                <div className="flex flex-wrap gap-2">
                                    {[...settings.unicodeWarning.allowedChars].map((char, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-primary/10 text-primary rounded font-mono"
                                            title={`U+${char.codePointAt(0)?.toString(16).toUpperCase()}`}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Warning History */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Warning History
                                </CardTitle>
                                <CardDescription>
                                    Recent Unicode domain warnings
                                </CardDescription>
                            </div>
                            {warningLogs.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearHistory}>
                                    Clear History
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {warningLogs.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-4 text-center">
                                No warning history yet.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {warningLogs.map(log => (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                                    >
                                        <div>
                                            <p className="font-mono">{log.unicodeDomain || log.domain}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${log.action === 'whitelisted'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : log.action === 'proceeded'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                        >
                                            {log.action}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Credits */}
                <div className="text-center space-y-1 pt-4 border-t">
                    <p className="text-sm font-medium">SCEU+ (Simple Chrome Extension Utilities Plus)</p>
                    <p className="text-xs text-muted-foreground">v1.0.0</p>
                    <p className="text-xs text-muted-foreground">
                        Created by{' '}
                        <a href="https://x.com/Mohelmaachi" target="_blank" rel="noopener" className="text-primary hover:underline">
                            Mohammed EL MAACHI
                        </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Fork of{' '}
                        <a href="https://github.com/ThioJoe/Simple-Chrome-Extension-Utilities" target="_blank" rel="noopener" className="text-primary hover:underline">
                            ThioJoe's Simple-Chrome-Extension-Utilities
                        </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <a href="https://github.com/mhmddesign/SCEU-Plus" target="_blank" rel="noopener" className="text-primary hover:underline">
                            Open Source on GitHub
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
