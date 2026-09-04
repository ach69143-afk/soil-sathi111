import { cn } from '@/lib/utils'
import type { Range, Status } from '@/lib/soil/types'
import { STATUS_DOT } from './status-badge'

interface LevelGaugeProps {
  value: number
  axis: Range
  optimal: Range
  status: Status
  unit?: string
  decimals?: number
  className?: string
}

/**
 * Horizontal level gauge: full axis track, highlighted optimal band, value marker.
 * Reads left→right so farmers can see instantly whether the value sits inside the band.
 */
export function LevelGauge({ value, axis, optimal, status, unit = '', decimals = 0, className }: LevelGaugeProps) {
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - axis.min) / (axis.max - axis.min)) * 100))
  const left = pct(optimal.min)
  const width = pct(optimal.max) - left
  const marker = pct(value)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="relative h-2.5 w-full rounded-full bg-muted" role="img" aria-label={`Value ${value.toFixed(decimals)}${unit}, optimal ${optimal.min}–${optimal.max}${unit}`}>
        <div
          className="absolute inset-y-0 rounded-full bg-status-good/30"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div
          className={cn('absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-card shadow-md transition-[left] duration-700 ease-out', STATUS_DOT[status])}
          style={{ left: `${marker}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium tabular text-muted-foreground">
        <span>{axis.min}{unit}</span>
        <span className="text-foreground/70">
          {optimal.min}–{optimal.max}{unit}
        </span>
        <span>{axis.max}{unit}</span>
      </div>
    </div>
  )
}
