import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

export function CategoryList({ categories }: { categories: Array<{ category: string; qty: number; totalInCents: number }> }) {
    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Vendas por Categoria
                    <HelpTooltip content="Mostra o desempenho de vendas agrupado por categoria de produtos. Cada item lista a quantidade vendida e o valor total faturado por categoria. Esta análise ajuda a identificar quais categorias são mais lucrativas, entender o mix de produtos e direcionar estratégias de marketing e estoque." />
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhuma categoria registrada</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map((category, index) => (
                            <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge variant="secondary" className="text-xs font-medium w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                        {index + 1}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate" title={category.category}>
                                            {category.category}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {category.qty} itens vendidos
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-3">
                                    <div className="font-semibold text-sm">{formatCurrency(category.totalInCents)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
