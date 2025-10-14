import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface ExcessStockItem {
    productId: string
    name: string
    currentStock: number
    avgMonthlyMovement: number
    category: string | null
}

interface Props {
    items: ExcessStockItem[]
}

export function ExcessStockCard({ items }: Props) {
    const getExcessLevel = (current: number, avgMovement: number) => {
        if (avgMovement === 0) return { level: 'SEM MOVIMENTO', color: 'bg-red-100 text-red-800 border-red-200' }
        const monthsOfStock = current / avgMovement
        if (monthsOfStock > 12) return { level: 'EXCESSO ALTO', color: 'bg-red-100 text-red-800 border-red-200' }
        if (monthsOfStock > 6) return { level: 'EXCESSO MÉDIO', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
        if (monthsOfStock > 3) return { level: 'EXCESSO BAIXO', color: 'bg-orange-100 text-orange-800 border-orange-200' }
        return { level: 'NORMAL', color: 'bg-green-100 text-green-800 border-green-200' }
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Produtos em Excesso
                    <HelpTooltip content="Identifica produtos com estoque alto em relação ao movimento de vendas. Calcula quantos meses de estoque você tem baseado na média de movimentação dos últimos 30 dias. EXCESSO ALTO: mais de 12 meses de estoque. EXCESSO MÉDIO: 6-12 meses. EXCESSO BAIXO: 3-6 meses. SEM MOVIMENTO: produtos parados. Esta análise ajuda a identificar produtos com baixo giro que podem estar ocupando espaço desnecessário." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Produtos com estoque alto em relação ao movimento
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhum produto em excesso identificado</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 10).map((item, index) => {
                            const excessLevel = getExcessLevel(item.currentStock, item.avgMonthlyMovement)
                            const monthsOfStock = item.avgMonthlyMovement > 0 ? (item.currentStock / item.avgMonthlyMovement).toFixed(1) : '∞'

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
                                                {item.category || 'Sem categoria'}
                                            </div>
                                        </div>
                                        <Badge className={`text-xs ${excessLevel.color}`}>
                                            {excessLevel.level}
                                        </Badge>
                                    </div>
                                    <div className="text-right ml-3">
                                        <div className="font-semibold text-sm">
                                            {item.currentStock} unidades
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {monthsOfStock} meses de estoque
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
