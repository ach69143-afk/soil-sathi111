'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shell/page-header'
import { DashboardHero } from './hero'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function DashboardView() {
  const { field } = useField()
  const [range, setRange] = React.useState<TimeRange>('24H')
  const { data } = useReadings(field.id, range)
  const latest = data!.latest
  const profile = getProfile(field.crop, field.soilType)

  const prevTimestamp = React.useRef(latest.timestamp)
  React.useEffect(() => {
    if (latest.timestamp !== prevTimestamp.current) {
      toast('✓ Soil reading updated', { duration: 3000, position: 'bottom-center', style: { fontSize: '13px', padding: '8px 16px', minHeight: 'unset' } })
      prevTimestamp.current = latest.timestamp
    }
  }, [latest.timestamp])

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="flex flex-col gap-8 md:gap-10"
    >
      <motion.div variants={item}>
        <DashboardHero />
      </motion.div>

      <motion.section variants={item} className="flex flex-col gap-4" aria-labelledby="npk-heading">
        <SectionHeading
          id="npk-heading"
          title="NPK monitoring"
          description={`Targets for ${field.crop} on ${field.soilType} · ${profile.region}`}
          action={
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
              <Link href="/parameters">All parameters <ArrowRight data-icon="inline-end" /></Link>
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NpkCard paramKey="n" value={latest.n} optimal={profile.ranges.n} trend={getTrend(field.id, 'n')} />
          <NpkCard paramKey="p" value={latest.p} optimal={profile.ranges.p} trend={getTrend(field.id, 'p')} />
          <NpkCard paramKey="k" value={latest.k} optimal={profile.ranges.k} trend={getTrend(field.id, 'k')} className="md:col-span-2 xl:col-span-1" />
        </div>
      </motion.section>

      <motion.section variants={item} className="flex flex-col gap-4" aria-labelledby="vitals-heading">
        <SectionHeading id="vitals-heading" title="Soil vitals" description="Moisture, temperature and pH from the same probe" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <VitalCard paramKey="moisture" value={latest.moisture} optimal={profile.ranges.moisture} />
          <VitalCard paramKey="temperature" value={latest.temperature} optimal={profile.ranges.temperature} />
          <VitalCard paramKey="ph" value={latest.ph} optimal={profile.ranges.ph} className="sm:col-span-2 xl:col-span-1" />
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-[1.6fr_1fr]" aria-labelledby="telemetry-heading">
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
      </motion.section>
    </motion.div>
  )
}
