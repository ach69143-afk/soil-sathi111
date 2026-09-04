'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHero } from './hero'
import { DeviceStatusCard } from './device-status'
import { NpkCard } from '@/components/soil/npk-card'
import { VitalCard } from '@/components/soil/vital-card'
import { TelemetryChart } from '@/components/soil/telemetry-chart'
import { TimeRangeToggle } from '@/components/soil/time-range-toggle'
import { useField } from '@/components/soil/field-provider'
import { useReadings } from '@/lib/soil/use-readings'
import { getTrend } from '@/lib/soil/mock-source'
import { getProfile } from '@/lib/soil/thresholds'
import type { TimeRange } from '@/lib/soil/types'
import { SectionHeading } from '@/components/shell/section-heading'

export function DashboardView() {
  const { field } = useField()
  const [range, setRange] = React.useState<TimeRange>('24H')
  const { data } = useReadings(field.id, range)
  const latest = data!.latest
  const profile = getProfile(field.crop, field.soilType)

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <DashboardHero />

      <section className="flex flex-col gap-4" aria-labelledby="npk-heading">
        <SectionHeading
          id="npk-heading"
          title="NPK monitoring"
          description={`Targets for ${field.crop} on ${field.soilType} · ${profile.region}`}
          action={
            <Button variant="ghost" size="sm" className="rounded-full" render={<Link href="/parameters" />}>
              All parameters <ArrowRight data-icon="inline-end" />
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NpkCard paramKey="n" value={latest.n} optimal={profile.ranges.n} trend={getTrend(field.id, 'n')} className="rise-in" />
          <NpkCard paramKey="p" value={latest.p} optimal={profile.ranges.p} trend={getTrend(field.id, 'p')} className="rise-in [animation-delay:80ms]" />
          <NpkCard paramKey="k" value={latest.k} optimal={profile.ranges.k} trend={getTrend(field.id, 'k')} className="rise-in [animation-delay:160ms] md:col-span-2 xl:col-span-1" />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="vitals-heading">
        <SectionHeading id="vitals-heading" title="Soil vitals" description="Moisture, temperature and pH from the same probe" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <VitalCard paramKey="moisture" value={latest.moisture} optimal={profile.ranges.moisture} />
          <VitalCard paramKey="temperature" value={latest.temperature} optimal={profile.ranges.temperature} />
          <VitalCard paramKey="ph" value={latest.ph} optimal={profile.ranges.ph} className="sm:col-span-2 xl:col-span-1" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]" aria-labelledby="telemetry-heading">
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
            <div className="flex flex-col gap-1">
              <CardTitle id="telemetry-heading" className="font-display text-base">NPK telemetry</CardTitle>
              <CardDescription>Shaded band shows the nitrogen target range</CardDescription>
            </div>
            <TimeRangeToggle value={range} onChange={setRange} />
          </CardHeader>
          <CardContent className="px-2 pb-4 pt-2 md:px-4">
            <TelemetryChart metric="npk" series={data!.series} range={range} optimal={profile.ranges.n} height={280} />
          </CardContent>
        </Card>
        <DeviceStatusCard device={data!.device} />
      </section>
    </div>
  )
}
