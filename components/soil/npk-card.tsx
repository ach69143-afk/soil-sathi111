'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import { LevelGauge } from './level-gauge'
import { TrendIndicator } from './trend-indicator'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { PARAMETERS, evaluate } from '@/lib/soil/thresholds'
import type { ParameterKey, Range } from '@/lib/soil/types'
import { cn } from '@/lib/utils'

interface NpkCardProps {
  paramKey: 'n' | 'p' | 'k'
  value: number
  optimal: Range
  trend: number
  className?: string
}

const ACCENT: Record<'n' | 'p' | 'k', string> = {
  n: 'bg-chart-1',
  p: 'bg-chart-2',
  k: 'bg-chart-3',
}

const ACCENT_TEXT: Record<'n' | 'p' | 'k', string> = {
  n: 'text-chart-1',
  p: 'text-chart-2',
  k: 'text-chart-3',
}

function explanation(key: ParameterKey, status: ReturnType<typeof evaluate>): string {
  if (status === 'good') return PARAMETERS[key].description
  const label = PARAMETERS[key].label.toLowerCase()
  if (status === 'low') {
    if (key === 'p') return 'Low phosphorus can slow root growth and delay flowering. Worth confirming with a lab test.'
    return `Below the target band for this crop and soil. Slightly low ${label} may limit growth if it persists.`
  }
  if (status === 'high') return `Above the target band. Excess ${label} can waste inputs and unbalance uptake of other nutrients.`
  return `Well outside the target band. Review recent inputs and consider a lab test before acting.`
}

export function NpkCard({ paramKey, value, optimal, trend, className }: NpkCardProps) {
  const meta = PARAMETERS[paramKey]
  const status = evaluate(value, optimal)

  return (
    <Card className={cn('group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md', className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 px-5 pt-5 pb-0">
        <div className="flex items-center gap-3">
          <span className={cn('flex size-10 items-center justify-center rounded-xl font-display text-lg font-bold text-primary-foreground', ACCENT[paramKey])}>
            {meta.short}
          </span>
          <div className="flex flex-col">
            <span className="font-display text-base font-semibold leading-tight">{meta.label}</span>
            <span className="text-xs text-muted-foreground">Macronutrient</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-5 pt-5 pb-0">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <AnimatedNumber value={value} decimals={meta.decimals} className="font-display text-[40px] font-bold tabular leading-none tracking-tight" />
            <span className="text-sm font-medium text-muted-foreground">{meta.unit}</span>
          </div>
          <TrendIndicator delta={trend} decimals={0} deadband={1} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Optimal range</span>
            <span className={cn('font-semibold tabular', ACCENT_TEXT[paramKey])}>
              {optimal.min}–{optimal.max} {meta.unit}
            </span>
          </div>
          <LevelGauge value={value} axis={meta.axis} optimal={optimal} status={status} decimals={meta.decimals} />
        </div>

        <p className="text-pretty text-[13px] leading-relaxed text-muted-foreground">{explanation(paramKey, status)}</p>
      </CardContent>

      <CardFooter className="mt-5 border-t bg-muted/40 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 rounded-full text-primary hover:bg-accent"
          render={<Link href={`/assistant?q=${encodeURIComponent(`Explain my ${meta.label.toLowerCase()} level`)}`} />}
        >
          <Sparkles data-icon="inline-start" />
          AI insight
        </Button>
      </CardFooter>
    </Card>
  )
}
