"use client"
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpTooltip } from './help-tooltip'

type PaymentMethod = { method: string; count: number; totalInCents: number }

function formatCurrency(cents: number) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function PieChartClient({ data }: { data: PaymentMethod[] }) {
    const total = data.reduce((s, d) => s + d.totalInCents, 0)
    let cumulative = 0

    return (
        <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <svg width={140} height={140} viewBox="0 0 32 32" className="drop-shadow-sm">
                    <g transform="translate(16,16)">
                        {data.map((d, i) => {
                            const value = total > 0 ? d.totalInCents / total : 0
                            const start = cumulative
                            const end = cumulative + value
                            cumulative = end
                            const large = end - start > 0.5 ? 1 : 0
                            const startAngle = start * Math.PI * 2 - Math.PI / 2
                            const endAngle = end * Math.PI * 2 - Math.PI / 2
                            const x1 = Math.cos(startAngle) * 14
                            const y1 = Math.sin(startAngle) * 14
                            const x2 = Math.cos(endAngle) * 14
                            const y2 = Math.sin(endAngle) * 14
                            const dAttr = `M 0 0 L ${x1} ${y1} A 14 14 0 ${large} 1 ${x2} ${y2} Z`
                            return <path key={d.method} d={dAttr} fill={colors[i % colors.length]} />
                        })}
                    </g>
                </svg>
            </div>
            <div className="flex-1 space-y-3">
                {data.map((d, i) => {
                    const percentage = total > 0 ? ((d.totalInCents / total) * 100).toFixed(1) : 0
                    return (
                        <div key={d.method} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[i % colors.length] }}
                                />
                                <div>
                                    <div className="font-medium text-sm">{d.method}</div>
                                    <div className="text-xs text-muted-foreground">{d.count} transações</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-sm">{formatCurrency(d.totalInCents)}</div>
                                <div className="text-xs text-muted-foreground">{percentage}%</div>
                            </div>
                        </div>
                    )
                })}
                {data.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Nenhuma forma de pagamento registrada</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export function PaymentMethodsCard({ methods }: { methods: PaymentMethod[] }) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Formas de Pagamento
                    <HelpTooltip content="Mostra a distribuição das vendas por forma de pagamento utilizada pelos clientes. O gráfico de pizza representa a proporção de cada método, enquanto a lista mostra valores absolutos e número de transações. Esta análise ajuda a entender as preferências dos clientes e planejar estratégias de pagamento." />
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <PieChartClient data={methods} />
            </CardContent>
        </Card>
    )
}
