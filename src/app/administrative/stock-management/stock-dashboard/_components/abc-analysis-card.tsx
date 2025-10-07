import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface ABCItem {
    productId: string
    name: string
    category: string
    totalValueInCents: number
    percentage: number
    classification: 'A' | 'B' | 'C'
}

interface Props {
    items: ABCItem[]
}

export function ABCAnalysisCard({ items }: Props) {
    const getClassificationColor = (classification: 'A' | 'B' | 'C') => {
        switch (classification) {
            case 'A':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'B':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'C':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Análise ABC
                    <HelpTooltip content="A Análise ABC classifica os produtos por importância no estoque baseado no valor total. Classe A: produtos que representam 80% ou mais do valor total (alta prioridade). Classe B: produtos entre 15-80% do valor (média prioridade). Classe C: produtos abaixo de 15% do valor (baixa prioridade). Esta classificação ajuda a focar a atenção nos produtos mais críticos para o negócio." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Classificação dos produtos por importância no estoque
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhum dado disponível</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                                <span className="text-red-800">A - Alto impacto</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                                <span className="text-yellow-800">B - Médio impacto</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                                <span className="text-green-800">C - Baixo impacto</span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            {items.slice(0, 15).map((item, index) => (
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
                                        <Badge className={`text-xs ${getClassificationColor(item.classification)}`}>
                                            {item.classification}
                                        </Badge>
                                    </div>
                                    <div className="text-right ml-3">
                                        <div className="font-semibold text-sm">
                                            {(item.totalValueInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
