'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { NpkCard } from '@/components/soil/npk-card'
import { VitalCard } from '@/components/soil/vital-card'
import { TelemetryChart } from '@/components/soil/telemetry-chart'
import { TimeRangeToggle } from '@/components/soil/time-range-toggle'
import { PageHeader } from '@/components/shell/page-header'
import { useField } from '@/components/soil/field-provider'
import { useReadings } from '@/lib/soil/use-readings'
import { getTrend } from '@/lib/soil/mock-source'
import { getProfile } from '@/lib/soil/thresholds'
import type { TimeRange } from '@/lib/soil/types'

export default function ParametersPage() {
  const { field } = useField()
  const [range, setRange] = React.useState<TimeRange>('24H')
  const { data } = useReadings(field.id, range)
  const latest = data!.latest
  const profile = getProfile(field.crop, field.soilType)

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <PageHeader
        eyebrow="Soil parameters"
        title="Full Parameter View"
        description={`Detailed readings from ${field.name} · ${field.crop} on ${field.soilType}`}
        actions={<TimeRangeToggle value={range} onChange={setRange} />}
      />

      {/* NPK Section */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">NPK Macronutrients</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NpkCard paramKey="n" value={latest.n} optimal={profile.ranges.n} trend={getTrend(field.id, 'n')} className="rise-in" />
          <NpkCard paramKey="p" value={latest.p} optimal={profile.ranges.p} trend={getTrend(field.id, 'p')} className="rise-in [animation-delay:80ms]" />
          <NpkCard paramKey="k" value={latest.k} optimal={profile.ranges.k} trend={getTrend(field.id, 'k')} className="rise-in [animation-delay:160ms] md:col-span-2 xl:col-span-1" />
        </div>
      </section>

      {/* Soil Vitals */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Soil Vitals</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <VitalCard paramKey="moisture" value={latest.moisture} optimal={profile.ranges.moisture} />
          <VitalCard paramKey="temperature" value={latest.temperature} optimal={profile.ranges.temperature} />
          <VitalCard paramKey="ph" value={latest.ph} optimal={profile.ranges.ph} className="sm:col-span-2 xl:col-span-1" />
        </div>
      </section>

      {/* Individual Telemetry Charts */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Telemetry Charts</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="font-display text-base">NPK Telemetry</CardTitle>
              <CardDescription>N·P·K trends over time — shaded band shows nitrogen target</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-2 md:px-4">
              <TelemetryChart metric="npk" series={data!.series} range={range} optimal={profile.ranges.n} height={240} />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="font-display text-base">Soil pH</CardTitle>
              <CardDescription>Acidity/alkalinity — shaded band is the target range</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-2 md:px-4">
              <TelemetryChart metric="ph" series={data!.series} range={range} optimal={profile.ranges.ph} height={240} />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="font-display text-base">Soil Moisture</CardTitle>
              <CardDescription>Volumetric water content in the root zone</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-2 md:px-4">
              <TelemetryChart metric="moisture" series={data!.series} range={range} optimal={profile.ranges.moisture} height={240} />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="font-display text-base">Soil Temperature</CardTitle>
              <CardDescription>Root-zone temperature affecting microbe activity</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-2 md:px-4">
              <TelemetryChart metric="temperature" series={data!.series} range={range} optimal={profile.ranges.temperature} height={240} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
