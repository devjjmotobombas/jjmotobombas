import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface Item {
    id: string
    title: string
    subtitle?: string
    value?: number | string
    badge?: string
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

interface Props {
    title: string
    items: Item[]
    helpText?: string
}

export function StockTopList({ title, items, helpText }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    {title}
                    {helpText && <HelpTooltip content={helpText} />}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhum dado disponível</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 10).map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge variant="secondary" className="text-xs font-medium w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                        {index + 1}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate" title={item.title}>
                                            {item.title}
                                        </div>
                                        {item.subtitle && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {item.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    {item.badge && (
                                        <Badge variant={item.badgeVariant || 'secondary'} className="text-xs">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-right ml-3">
                                    {typeof item.value !== 'undefined' && (
                                        <div className="font-semibold text-sm">
                                            {typeof item.value === 'number'
                                                ? item.value.toLocaleString('pt-BR')
                                                : item.value
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
