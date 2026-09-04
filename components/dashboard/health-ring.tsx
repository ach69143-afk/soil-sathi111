import type { Status } from '@/lib/soil/types'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ui/animated-number'

const STROKE: Record<Status, string> = {
  good: 'stroke-status-good',
  low: 'stroke-status-warn',
  high: 'stroke-status-warn',
  critical: 'stroke-status-critical',
}

export function HealthRing({ score, status, size = 148 }: { score: number; status: Status; size?: number }) {
  const r = 54
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Soil health score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="9" className="stroke-canopy-foreground/12" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={cn('transition-[stroke-dasharray] duration-1000 ease-out', STROKE[status])}
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="font-display text-4xl font-bold tabular leading-none" />
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-canopy-foreground/60">Soil health</span>
      </div>
    </div>
  )
}
