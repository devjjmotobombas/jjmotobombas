"use client"
import { TrendingUp } from 'lucide-react'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface RevenueData {
    date: string
    totalInCents: number
}

interface RevenueChartProps {
    data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }

    const maxValue = Math.max(...data.map(d => d.totalInCents), 1)

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        Receita por Dia
                        <HelpTooltip content="Mostra a evolução diária da receita no período selecionado. Cada barra representa o faturamento total de um dia específico. O gráfico ajuda a identificar padrões de vendas, dias de maior movimento e tendências sazonais. Valores são calculados pelo preço de venda dos produtos." />
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Evolução diária</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="text-sm">Nenhum dado de receita disponível</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Gráfico de barras simples */}
                        <div className="space-y-2">
                            {data.slice(-14).map((item) => {
                                const percentage = (item.totalInCents / maxValue) * 100
                                return (
                                    <div key={item.date} className="flex items-center gap-3">
                                        <div className="text-xs text-muted-foreground w-12 text-right">
                                            {formatDate(item.date)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                                    <span className={`text-xs font-medium ${percentage === 100 ? 'text-primary-foreground' : 'text-blue-600'}`}>
                                                        {formatCurrency(item.totalInCents)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Resumo */}
                        <div className="pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Maior receita</div>
                                    <div className="font-semibold">
                                        {formatCurrency(Math.max(...data.map(d => d.totalInCents)))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Receita média</div>
                                    <div className="font-semibold">
                                        {formatCurrency(data.reduce((sum, d) => sum + d.totalInCents, 0) / data.length)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
