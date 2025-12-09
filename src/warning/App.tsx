import { useEffect, useState } from 'react';
import { ShieldAlert, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { IUnicodeWarningSettings } from '@/types';

function App() {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('target') || '';

    const [hostname, setHostname] = useState('');
    const [unicodeHostname, setUnicodeHostname] = useState('');
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        // Apply dark mode based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);

        try {
            const url = new URL(targetUrl);
            setHostname(url.hostname);

            // The browser usually shows punycode in url.hostname
            // Try to get the unicode version
            setUnicodeHostname(url.hostname);
        } catch {
            setHostname('Unknown Domain');
        }

        setCanGoBack(window.history.length > 1);
    }, [targetUrl]);

    const handleGoBack = () => {
        window.history.back();
    };

    const handleProceed = async () => {
        try {
            // Add to temporary dismissals for this session
            const localData = await chrome.storage.local.get(['tempDismissed', 'sessionToken']);
            const warningPageUrl = chrome.runtime.getURL('src/warning/index.html');

            let dismissed = localData.tempDismissed || [];
            let storedToken = localData.sessionToken;

            // Reset if session changed
            if (storedToken !== warningPageUrl) {
                dismissed = [];
                storedToken = warningPageUrl;
            }

            if (!dismissed.includes(hostname)) {
                dismissed.push(hostname);
            }

            await chrome.storage.local.set({
                tempDismissed: dismissed,
                sessionToken: storedToken,
            });

            // Log this action
            await chrome.runtime.sendMessage({
                type: 'LOG_WARNING',
                payload: { domain: hostname, unicodeDomain: unicodeHostname, action: 'proceeded' },
            });

            window.location.replace(targetUrl);
        } catch (error) {
            console.error('Failed to proceed:', error);
            window.location.replace(targetUrl);
        }
    };

    const handleWhitelist = async () => {
        try {
            // Add to permanent whitelist
            const result = await chrome.storage.sync.get('settings');
            const settings = result.settings || {};
            const unicodeWarning: IUnicodeWarningSettings = settings.unicodeWarning || {
                enabled: true,
                whitelist: [],
                whitelistMetadata: {},
                allowedChars: '',
            };

            if (!unicodeWarning.whitelist.includes(hostname)) {
                unicodeWarning.whitelist.push(hostname);
                unicodeWarning.whitelistMetadata[hostname] = {
                    added: new Date().toISOString().split('T')[0],
                    title: 'Whitelisted via Warning Page',
                };
            }

            await chrome.storage.sync.set({
                settings: { ...settings, unicodeWarning },
            });

            // Log this action
            await chrome.runtime.sendMessage({
                type: 'LOG_WARNING',
                payload: { domain: hostname, unicodeDomain: unicodeHostname, action: 'whitelisted' },
            });

            window.location.replace(targetUrl);
        } catch (error) {
            console.error('Failed to whitelist:', error);
            window.location.replace(targetUrl);
        }
    };

    // Highlight unicode characters in the hostname
    const renderHighlightedDomain = (domain: string) => {
        return [...domain].map((char, index) => {
            const isUnicode = char.codePointAt(0)! > 127;
            return (
                <span
                    key={index}
                    className={isUnicode ? 'text-red-500 font-bold underline decoration-wavy' : ''}
                    title={isUnicode ? `U+${char.codePointAt(0)!.toString(16).toUpperCase()}` : undefined}
                >
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="max-w-lg w-full shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <CardTitle className="text-xl text-amber-700 dark:text-amber-500">
                        ⚠️ Unicode Domain Warning
                    </CardTitle>
                    <CardDescription>
                        This domain contains non-ASCII characters that could be used for phishing
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Domain Display */}
                    <div className="rounded-lg bg-muted p-4 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">You are trying to visit:</p>
                        <p className="text-lg font-mono font-bold break-all">
                            {renderHighlightedDomain(unicodeHostname || hostname)}
                        </p>
                        {hostname !== unicodeHostname && (
                            <p className="text-xs text-muted-foreground font-mono">
                                Punycode: {hostname}
                            </p>
                        )}
                    </div>

                    {/* Warning Info */}
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-amber-800 dark:text-amber-300">
                                <p className="font-medium mb-1">Why am I seeing this?</p>
                                <p className="text-amber-700 dark:text-amber-400 text-xs">
                                    Attackers use look-alike Unicode characters to create fake domains
                                    (e.g., "аpple.com" using Cyrillic "а" instead of Latin "a").
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-2">
                        <Button
                            variant="outline"
                            onClick={handleGoBack}
                            disabled={!canGoBack}
                            className="w-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back to Safety
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleProceed}
                                className="w-full"
                            >
                                Continue Once
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleWhitelist}
                                className="w-full"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Trust & Whitelist
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-center text-muted-foreground">
                        If you trust this site, click "Trust & Whitelist" to never see this warning again.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default App;
