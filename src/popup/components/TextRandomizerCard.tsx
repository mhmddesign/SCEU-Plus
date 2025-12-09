import { Shuffle, Eye, Regex, User, MapPin, Type } from 'lucide-react';
import { ModuleCard } from './ModuleCard';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';

export function TextRandomizerCard() {
    const { settings, updateTextRandomizer } = useSettingsStore();
    const { textRandomizer } = settings;

    return (
        <ModuleCard
            title="Text Randomizer"
            description="Replace or blur text on any page"
            icon={<Shuffle className="h-4 w-4" />}
            enabled={textRandomizer.enabled}
            onToggle={(enabled) => updateTextRandomizer({ enabled })}
            accentColor="bg-blue-500"
        >
            {/* Blur Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="blur-toggle" className="text-sm flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        Auto-blur after randomizing
                    </Label>
                    <Switch
                        id="blur-toggle"
                        checked={textRandomizer.blurEnabled}
                        onCheckedChange={(checked) => updateTextRandomizer({ blurEnabled: checked })}
                    />
                </div>

                {textRandomizer.blurEnabled && (
                    <div className="space-y-1.5 pl-5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Blur intensity</span>
                            <span>{textRandomizer.blurIntensity}px</span>
                        </div>
                        <Slider
                            value={[textRandomizer.blurIntensity]}
                            onValueChange={([value]) => updateTextRandomizer({ blurIntensity: value })}
                            min={1}
                            max={20}
                            step={1}
                            className="w-full"
                        />
                    </div>
                )}
            </div>

            {/* Regex Filter */}
            <div className="flex items-center justify-between">
                <Label htmlFor="regex-toggle" className="text-sm flex items-center gap-2">
                    <Regex className="h-3.5 w-3.5" />
                    Regex filter
                </Label>
                <Switch
                    id="regex-toggle"
                    checked={textRandomizer.regexEnabled}
                    onCheckedChange={(checked) => updateTextRandomizer({ regexEnabled: checked })}
                />
            </div>

            {/* Fake Data Type */}
            <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Replace with:</Label>
                <div className="grid grid-cols-2 gap-1.5">
                    {[
                        { value: 'random', label: 'Random', icon: Type },
                        { value: 'lorem', label: 'Lorem', icon: Type },
                        { value: 'names', label: 'Names', icon: User },
                        { value: 'addresses', label: 'Address', icon: MapPin },
                    ].map(({ value, label, icon: Icon }) => (
                        <Button
                            key={value}
                            variant={textRandomizer.fakeDataType === value ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => updateTextRandomizer({ fakeDataType: value as typeof textRandomizer.fakeDataType })}
                        >
                            <Icon className="h-3 w-3 mr-1" />
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Click Modes:</p>
                <ul className="space-y-0.5 pl-3">
                    <li>• <kbd className="px-1 bg-muted rounded">Alt</kbd> + Click → Randomize</li>
                    <li>• <kbd className="px-1 bg-muted rounded">Ctrl</kbd> + Click → Blur</li>
                    <li>• <kbd className="px-1 bg-muted rounded">Ctrl+Z</kbd> → Undo</li>
                </ul>
            </div>
        </ModuleCard>
    );
}
