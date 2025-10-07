import { DollarSign, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react'
import React from 'react'

import { Card } from '@/components/ui/card'

interface Props {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
}

export function SummaryCard({ title, value, subtitle, icon, trend }: Props) {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />
        if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />
        return null
    }

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600'
        if (trend === 'down') return 'text-red-600'
        return 'text-muted-foreground'
    }

    return (
        <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">{title}</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
                    {subtitle && (
                        <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span>{subtitle}</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
        </Card>
    )
}

export const SummaryCardIcons = {
    revenue: <DollarSign className="h-5 w-5" />,
    sales: <ShoppingCart className="h-5 w-5" />,
    clients: <Users className="h-5 w-5" />,
    growth: <TrendingUp className="h-5 w-5" />,
}
