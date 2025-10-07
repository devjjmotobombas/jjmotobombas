import { CheckCircle, Target, TrendingUp } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface ConversionCardProps {
    budgetsCount: number
    convertedToSales: number
    conversionRate: number
}

export function ConversionCard({ budgetsCount, convertedToSales, conversionRate }: ConversionCardProps) {
    const getConversionColor = (rate: number) => {
        if (rate >= 50) return 'text-green-600'
        if (rate >= 25) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getConversionBadgeVariant = (rate: number) => {
        if (rate >= 50) return 'default' as const
        if (rate >= 25) return 'secondary' as const
        return 'destructive' as const
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversão Orçamento → Venda
                    <HelpTooltip content="Mostra a taxa de conversão de orçamentos em vendas efetivas. Calcula quantos orçamentos gerados foram convertidos em vendas reais. Uma taxa alta indica boa eficiência comercial, enquanto baixa pode indicar necessidade de melhorar o processo de follow-up ou ajustar preços. Taxa ideal: 40% ou mais." />
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-6">
                    {/* Taxa de conversão principal */}
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${getConversionColor(conversionRate)}`}>
                            {conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Taxa de conversão</div>
                        <Badge
                            variant={getConversionBadgeVariant(conversionRate)}
                            className="mt-2"
                        >
                            {conversionRate >= 50 ? 'Excelente' : conversionRate >= 25 ? 'Boa' : 'Pode melhorar'}
                        </Badge>
                    </div>

                    {/* Estatísticas detalhadas */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <Target className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">Total de Orçamentos</div>
                                    <div className="text-xs text-muted-foreground">Gerados no período</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-sm">{budgetsCount}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">Convertidos em Vendas</div>
                                    <div className="text-xs text-muted-foreground">Orçamentos aprovados</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-sm">{convertedToSales}</div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progresso visual */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso da conversão</span>
                            <span>{conversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${conversionRate >= 50 ? 'bg-green-500' :
                                    conversionRate >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(conversionRate, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta sugerida */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium text-primary">Meta sugerida: 40%+</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Taxa ideal para um bom desempenho comercial
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
