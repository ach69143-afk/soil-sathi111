import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  delta: number
  unit?: string
  decimals?: number
  /** Threshold below which the trend is shown as "stable" */
  deadband?: number
  className?: string
}

export function TrendIndicator({ delta, unit = '', decimals = 0, deadband = 0.5, className }: TrendIndicatorProps) {
  const stable = Math.abs(delta) < deadband
  const up = delta > 0
  const Icon = stable ? Minus : up ? ArrowUpRight : ArrowDownRight
  const text = stable ? 'Stable' : `${up ? '+' : '−'}${Math.abs(delta).toFixed(decimals)}${unit}`

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium tabular text-muted-foreground', className)}>
      <Icon className="size-3.5" />
      <span>{text}</span>
      <span className="text-muted-foreground/70">24h</span>
    </span>
  )
}
