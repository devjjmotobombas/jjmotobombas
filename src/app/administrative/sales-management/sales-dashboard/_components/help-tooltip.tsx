import { HelpCircle } from 'lucide-react'
import React from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HelpTooltipProps {
    content: string
}

export function HelpTooltip({ content }: HelpTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full  hover:bg-muted-foreground/30 transition-colors cursor-help">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
