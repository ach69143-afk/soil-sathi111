'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { PARAMETERS } from '@/lib/soil/thresholds'
import type { ParameterKey, Range, SensorReading, TimeRange } from '@/lib/soil/types'

export type TelemetryMetric = 'npk' | 'ph' | 'moisture' | 'temperature'

/** Y-axis domains per metric so each chart sits in a meaningful scale. */
const DOMAINS: Record<TelemetryMetric, [number, number]> = {
  npk: [0, 320],
  ph: [5, 9],
  moisture: [20, 100],
  temperature: [10, 40],
}

const CONFIG: Record<TelemetryMetric, ChartConfig> = {
  npk: {
    n: { label: 'Nitrogen (N)', color: 'var(--chart-1)' },
    p: { label: 'Phosphorus (P)', color: 'var(--chart-2)' },
    k: { label: 'Potassium (K)', color: 'var(--chart-3)' },
  },
  ph: { ph: { label: 'Soil pH', color: 'var(--chart-4)' } },
  moisture: { moisture: { label: 'Moisture (%)', color: 'var(--chart-5)' } },
  temperature: { temperature: { label: 'Temperature (°C)', color: 'var(--chart-2)' } },
}

function formatTick(iso: string, range: TimeRange) {
  const d = new Date(iso)
  if (range === '7D') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
}

interface TelemetryChartProps {
  metric: TelemetryMetric
  series: SensorReading[]
  range: TimeRange
  /** Optimal band to shade; for NPK charts pass the N band or omit. */
  optimal?: Range
  height?: number
  compact?: boolean
}

export function TelemetryChart({ metric, series, range, optimal, height = 260, compact = false }: TelemetryChartProps) {
  const config = CONFIG[metric]
  const [min, max] = DOMAINS[metric]
  const keys = Object.keys(config) as ParameterKey[]
  const decimals = PARAMETERS[keys[0]].decimals

  const data = React.useMemo(
    () => series.map((r) => ({ ...r, t: r.timestamp })),
    [series],
  )

  const shared = {
    data,
    margin: { top: 8, right: 8, left: compact ? -16 : -8, bottom: 0 },
  }

  const axes = (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
      <XAxis
        dataKey="t"
        tickLine={false}
        axisLine={false}
        minTickGap={28}
        tickMargin={8}
        tickFormatter={(v) => formatTick(v, range)}
        className="text-[11px]"
      />
      <YAxis
        domain={[min, max]}
        tickLine={false}
        axisLine={false}
        width={compact ? 34 : 44}
        tickCount={5}
        tickFormatter={(v: number) => v.toFixed(decimals)}
        className="text-[11px]"
      />
      {optimal && (
        <ReferenceArea y1={optimal.min} y2={optimal.max} fill="var(--status-good)" fillOpacity={0.09} strokeOpacity={0} />
      )}
      <ChartTooltip
        cursor={{ stroke: 'var(--border)' }}
        content={
          <ChartTooltipContent
            labelFormatter={(_, payload) => formatLabel(String(payload?.[0]?.payload?.t ?? ''))}
            formatter={(value, name, item) => (
              <div className="flex flex-1 items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: item.color }} />
                  {config[name as string]?.label ?? name}
                </span>
                <span className="font-mono font-medium tabular text-foreground">{Number(value).toFixed(decimals)}</span>
              </div>
            )}
          />
        }
      />
    </>
  )

  return (
    <ChartContainer config={config} className="w-full" style={{ height }}>
      {metric === 'npk' ? (
        <LineChart {...shared}>
          {axes}
          {keys.map((k) => (
            <Line key={k} type="monotone" dataKey={k} stroke={`var(--color-${k})`} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          ))}
          {!compact && <ChartLegend content={<ChartLegendContent />} />}
        </LineChart>
      ) : (
        <AreaChart {...shared}>
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--color-${keys[0]})`} stopOpacity={0.28} />
              <stop offset="100%" stopColor={`var(--color-${keys[0]})`} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {axes}
          <Area
            type="monotone"
            dataKey={keys[0]}
            stroke={`var(--color-${keys[0]})`}
            strokeWidth={2.2}
            fill={`url(#fill-${metric})`}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    </ChartContainer>
  )
}
