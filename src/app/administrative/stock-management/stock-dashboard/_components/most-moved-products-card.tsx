import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface MovementItem {
    productId: string
    name: string
    totalMovements: number
    entries: number
    exits: number
    category: string | null
}

interface Props {
    items: MovementItem[]
}

export function MostMovedProductsCard({ items }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Produtos Mais Movimentados
                    <HelpTooltip content="Mostra os produtos com maior movimentação de estoque no período selecionado, incluindo tanto entradas (compras/reposições) quanto saídas (vendas/ajustes). O total de movimentos é a soma de todas as entradas e saídas. Esta métrica ajuda a identificar quais produtos têm maior rotatividade e demanda, sendo importantes para o planejamento de compras e gestão de estoque." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Produtos com maior movimentação de estoque
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhuma movimentação registrada</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 10).map((item, index) => (
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
                                            {item.category || 'Sem categoria'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-3">
                                    <div className="font-semibold text-sm">
                                        {item.totalMovements} movimentos
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        +{item.entries} / -{item.exits}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
