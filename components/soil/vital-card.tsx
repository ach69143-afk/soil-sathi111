import { Droplets, Thermometer, TestTube2, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { LevelGauge } from './level-gauge'
import { PARAMETERS, evaluate } from '@/lib/soil/thresholds'
import type { Range } from '@/lib/soil/types'
import { cn } from '@/lib/utils'

type VitalKey = 'moisture' | 'temperature' | 'ph'

const ICON: Record<VitalKey, LucideIcon> = {
  moisture: Droplets,
  temperature: Thermometer,
  ph: TestTube2,
}

function explain(key: VitalKey, status: ReturnType<typeof evaluate>, value: number): string {
  switch (key) {
    case 'moisture':
      if (status === 'low') return 'Root zone is drying out. Check the forecast before deciding on irrigation.'
      if (status === 'high') return 'Soil is wetter than ideal. Hold irrigation and watch for waterlogging.'
      return 'Comfortable moisture for this crop stage. No irrigation needed right now.'
    case 'temperature':
      if (status === 'low') return 'Cool soil slows nutrient uptake and germination.'
      if (status === 'high') return 'Warm soil increases evaporation; mulching can help retain moisture.'
      return 'Within the range where roots and soil microbes are most active.'
    case 'ph':
      if (value < 6) return 'Slightly acidic. Phosphorus and calcium can become less available.'
      if (value > 7.5) return 'Slightly alkaline. Iron and zinc may become locked up in the soil.'
      return 'Near neutral, which keeps most nutrients available to roots.'
  }
}

export function VitalCard({ paramKey, value, optimal, className }: { paramKey: VitalKey; value: number; optimal: Range; className?: string }) {
  const meta = PARAMETERS[paramKey]
  const status = evaluate(value, optimal)
  const Icon = ICON[paramKey]

  return (
    <Card className={cn('gap-0 py-0 transition-shadow hover:shadow-md', className)}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-[18px]" />
            </span>
            <span className="font-display text-sm font-semibold">{meta.label}</span>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-bold tabular leading-none tracking-tight">{value.toFixed(meta.decimals)}</span>
          <span className="text-sm font-medium text-muted-foreground">{meta.unit}</span>
        </div>
        <LevelGauge value={value} axis={meta.axis} optimal={optimal} status={status} decimals={meta.decimals} unit={meta.unit} />
        <p className="text-pretty text-[13px] leading-relaxed text-muted-foreground">{explain(paramKey, status, value)}</p>
      </CardContent>
    </Card>
  )
}
