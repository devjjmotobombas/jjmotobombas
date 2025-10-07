import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

interface MovementData {
    date: string
    quantity: number
    valueInCents: number
}

interface Props {
    entries: MovementData[]
    exits: MovementData[]
}

export function StockMovementChart({ entries, exits }: Props) {
    // Combine and sort data by date
    const allDates = Array.from(new Set([...entries.map(e => e.date), ...exits.map(e => e.date)])).sort()

    const chartData = allDates.map(date => {
        const entry = entries.find(e => e.date === date)
        const exit = exits.find(e => e.date === date)

        return {
            date,
            entries: entry?.quantity || 0,
            exits: exit?.quantity || 0,
            entryValue: entry?.valueInCents || 0,
            exitValue: exit?.valueInCents || 0
        }
    })

    const maxQuantity = Math.max(...chartData.map(d => Math.max(d.entries, d.exits)), 1)

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Movimentação de Estoque
                    <HelpTooltip content="Mostra o histórico de entradas e saídas de produtos por dia no período selecionado. Entradas incluem compras, reposições e ajustes positivos. Saídas incluem vendas, ajustes negativos e perdas. O gráfico ajuda a visualizar padrões de movimentação, identificar dias de maior atividade e planejar melhor o fluxo de estoque. Valores são calculados pelo preço de compra dos produtos." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Entradas e saídas por período
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                {chartData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhuma movimentação no período</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Legend */}
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                <span>Entradas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <span>Saídas</span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="space-y-2">
                            {chartData.slice(-15).map((data) => (
                                <div key={data.date} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{new Date(data.date).toLocaleDateString('pt-BR')}</span>
                                        <span>Total: {data.entries + data.exits} unidades</span>
                                    </div>
                                    <div className="flex gap-1 h-6">
                                        {/* Entry bar */}
                                        {data.entries > 0 && (
                                            <div
                                                className="bg-green-500 rounded-lg flex items-center justify-end pr-2 text-xs text-white font-medium"
                                                style={{ width: `${(data.entries / maxQuantity) * 100}%` }}
                                            >
                                                {data.entries > maxQuantity * 0.1 && data.entries}
                                            </div>
                                        )}
                                        {/* Exit bar */}
                                        {data.exits > 0 && (
                                            <div
                                                className="bg-red-500 rounded-lg flex items-center justify-start pl-2 text-xs text-white font-medium"
                                                style={{ width: `${(data.exits / maxQuantity) * 100}%` }}
                                            >
                                                {data.exits > maxQuantity * 0.1 && data.exits}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">
                                    {chartData.reduce((sum, d) => sum + d.entries, 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Entradas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-red-600">
                                    {chartData.reduce((sum, d) => sum + d.exits, 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Saídas</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
