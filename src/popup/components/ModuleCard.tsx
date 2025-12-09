import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children?: ReactNode;
    className?: string;
    accentColor?: string;
}

export function ModuleCard({
    title,
    description,
    icon,
    enabled,
    onToggle,
    children,
    className,
    accentColor = 'bg-primary',
}: ModuleCardProps) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-200',
                enabled ? 'ring-2 ring-primary/50' : 'opacity-90',
                className
            )}
        >
            {/* Accent bar */}
            <div
                className={cn(
                    'absolute left-0 top-0 h-full w-1 transition-opacity',
                    accentColor,
                    enabled ? 'opacity-100' : 'opacity-30'
                )}
            />

            <CardHeader className="pb-2 pl-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <CardDescription className="text-xs">{description}</CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor={`${title}-toggle`} className="sr-only">
                            Enable {title}
                        </Label>
                        <Switch
                            id={`${title}-toggle`}
                            checked={enabled}
                            onCheckedChange={onToggle}
                        />
                    </div>
                </div>
            </CardHeader>

            {enabled && children && (
                <CardContent className="pl-5 pt-2">
                    <div className="space-y-3">{children}</div>
                </CardContent>
            )}
        </Card>
    );
}
