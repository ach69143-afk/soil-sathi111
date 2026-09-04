'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PARAMETERS, evaluate, statusLabel } from '@/lib/soil/thresholds'
import type { ParameterKey, Reading, Profile } from '@/lib/soil/types'
import { StatusBadge } from '@/components/soil/status-badge'
import { Droplets, Thermometer, TestTube2, Sprout, Clock } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/lib/utils'

interface LiveContextPanelProps {
  latest: Reading
  profile: Profile
}

const KEYS: ParameterKey[] = ['n', 'p', 'k', 'moisture', 'temperature', 'ph']

const ICON_MAP = {
  moisture: Droplets,
  temperature: Thermometer,
  ph: TestTube2,
  n: Sprout,
  p: Sprout,
  k: Sprout
}

export function LiveContextPanel({ latest, profile }: LiveContextPanelProps) {
  const statuses = Object.fromEntries(
    KEYS.map(k => [k, evaluate(latest[k], profile.ranges[k])])
  ) as Record<ParameterKey, ReturnType<typeof evaluate>>

  const timeAgo = formatDistanceToNow(latest.timestamp, { addSuffix: true })

  const problemParams = KEYS.filter(k => statuses[k] !== 'good')
  const isHealthy = problemParams.length === 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-status-good animate-pulse" />
              Live Soil Context
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {timeAgo}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 pb-4">
          {KEYS.map(key => {
            const meta = PARAMETERS[key]
            const status = statuses[key]
            const Icon = ICON_MAP[key as keyof typeof ICON_MAP]
            
            return (
              <div key={key} className="flex flex-col gap-1.5 rounded-lg border bg-card p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="size-3.5" />
                    <span className="text-xs font-medium">{meta.label}</span>
                  </div>
                  <StatusBadge status={status} className="h-4 text-[9px] px-1.5" />
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <AnimatedNumber 
                    value={latest[key]} 
                    decimals={meta.decimals} 
                    className="font-display font-semibold text-base tabular leading-none" 
                  />
                  <span className="text-[10px] text-muted-foreground">{meta.unit}</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className={cn(
        "shadow-sm border-l-4",
        isHealthy ? "border-l-status-good" : "border-l-status-warn"
      )}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isHealthy ? (
              <>Your field is healthy overall. All parameters are within the optimal range for {profile.crop}.</>
            ) : (
              <>
                Overall health is fair. <span className="font-medium text-foreground">{problemParams.map(p => PARAMETERS[p].label).join(', ')}</span> 
                {' '}{problemParams.length === 1 ? 'is' : 'are'} currently outside the target range and should be monitored.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
