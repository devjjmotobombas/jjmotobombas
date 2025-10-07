"use client"
import { CalendarDays, RotateCcw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function PeriodControls() {
    const router = useRouter()
    const params = useSearchParams()

    function setRange(start: Date, end: Date) {
        const qs = new URLSearchParams(Array.from(params.entries()))
        qs.set('startDate', start.toISOString().slice(0, 10))
        qs.set('endDate', end.toISOString().slice(0, 10))
        router.push(`${location.pathname}?${qs.toString()}`)
    }

    function resetToToday() {
        const today = new Date()
        const qs = new URLSearchParams()
        qs.set('startDate', today.toISOString().slice(0, 10))
        qs.set('endDate', today.toISOString().slice(0, 10))
        router.push(`${location.pathname}?${qs.toString()}`)
    }

    const periodButtons = [
        {
            label: 'Últimos 7 dias',
            onClick: () => {
                const end = new Date()
                const start = new Date()
                start.setDate(start.getDate() - 7)
                setRange(start, end)
            }
        },
        {
            label: 'Últimos 30 dias',
            onClick: () => {
                const end = new Date()
                const start = new Date()
                start.setMonth(start.getMonth() - 1)
                setRange(start, end)
            }
        },
        {
            label: 'Últimos 3 meses',
            onClick: () => {
                const end = new Date()
                const start = new Date()
                start.setMonth(start.getMonth() - 3)
                setRange(start, end)
            }
        }
    ]

    return (
        <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <CalendarDays className="h-4 w-4" />
                <span>Períodos rápidos:</span>
            </div>
            {periodButtons.map((button) => (
                <Button
                    key={button.label}
                    variant="outline"
                    size="sm"
                    onClick={button.onClick}
                    className="h-8 px-3 text-xs"
                >
                    {button.label}
                </Button>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={resetToToday}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
                <RotateCcw className="h-3 w-3 mr-1" />
                Resetar
            </Button>
        </div>
    )
}
