import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface LowStockItem {
    productId: string
    name: string
    currentStock: number
    minStock: number
    category: string
}

interface Props {
    items: LowStockItem[]
}

export function LowStockAlertCard({ items }: Props) {
    const getStockStatus = (current: number, min: number) => {
        if (current === 0) return { status: 'ZERO', color: 'bg-red-100 text-red-800 border-red-200' }
        if (current <= min) return { status: 'CRÍTICO', color: 'bg-orange-100 text-orange-800 border-orange-200' }
        if (current <= min * 1.5) return { status: 'BAIXO', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
        return { status: 'OK', color: 'bg-green-100 text-green-800 border-green-200' }
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Alertas de Estoque
                    <HelpTooltip content="Mostra produtos com estoque baixo ou crítico que precisam de reposição urgente. O estoque mínimo é calculado automaticamente como 10% do estoque atual ou 5 unidades, o que for maior. ZERO: sem estoque. CRÍTICO: estoque igual ou abaixo do mínimo. BAIXO: estoque até 50% acima do mínimo. Esta métrica ajuda a evitar rupturas de estoque e perda de vendas." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Produtos com estoque baixo ou crítico
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Todos os produtos com estoque adequado</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 10).map((item, index) => {
                            const stockStatus = getStockStatus(item.currentStock, item.minStock)
                            return (
                                <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Badge variant="secondary" className="text-xs font-medium w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                            {index + 1}
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate" title={item.name}>
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {item.category}
                                            </div>
                                        </div>
                                        <Badge className={`text-xs ${stockStatus.color}`}>
                                            {stockStatus.status}
                                        </Badge>
                                    </div>
                                    <div className="text-right ml-3">
                                        <div className="font-semibold text-sm">
                                            {item.currentStock} unidades
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Mín: {item.minStock}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
