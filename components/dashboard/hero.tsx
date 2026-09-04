'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Cpu, MapPin, Radio, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useField } from '@/components/soil/field-provider'
import { useReadings } from '@/lib/soil/use-readings'
import { FARMER } from '@/lib/soil/mock-source'
import { evaluate, getProfile, healthScore, overallStatus, PARAMETERS, statusLabel } from '@/lib/soil/thresholds'
import type { ParameterKey } from '@/lib/soil/types'
import { cn } from '@/lib/utils'
import { STATUS_DOT } from '@/components/soil/status-badge'
import { HealthRing } from './health-ring'

const KEYS: ParameterKey[] = ['n', 'p', 'k', 'moisture', 'temperature', 'ph']

export function DashboardHero() {
  const { field } = useField()
  const { data } = useReadings(field.id, '24H')
  const latest = data!.latest
  const profile = getProfile(field.crop, field.soilType)
  const statuses = KEYS.map((k) => evaluate(latest[k], profile.ranges[k]))
  const overall = overallStatus(statuses)
  const score = healthScore(
    { n: latest.n, p: latest.p, k: latest.k, moisture: latest.moisture, temperature: latest.temperature, ph: latest.ph },
    profile,
  )
  const connected = data!.device.controller.state === 'connected' && data!.device.sensor.state === 'active'

  return (
    <section className="rise-in relative overflow-hidden rounded-3xl bg-canopy text-canopy-foreground shadow-lg">
      <Image
        src="/images/field-aerial.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 1320px"
        className="object-cover opacity-45 mix-blend-luminosity"
      />
      <div className="soil-grid absolute inset-0" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,var(--canopy)_35%,transparent_85%)]" aria-hidden />

      <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8 lg:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-canopy-foreground/15 bg-canopy-foreground/10 px-3 py-1 text-xs font-medium">
              <span className={cn('pulse-ring relative size-2 rounded-full', connected ? 'bg-status-good text-status-good' : 'bg-status-critical text-status-critical')} />
              ESP32 & NPK Sensor: {connected ? 'Connected' : 'Offline'}
            </span>
            {connected && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-status-good/30 bg-status-good/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-status-good">
                <span className="pulse-ring relative size-1.5 rounded-full bg-status-good text-status-good" />
                Live
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-canopy-foreground/15 px-3 py-1 text-xs text-canopy-foreground/80">
              <MapPin className="size-3.5" />
              {FARMER.village}, {FARMER.district}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-balance text-3xl font-bold leading-[1.05] md:text-4xl lg:text-[44px]">
              Namaste, {FARMER.name}!
            </h1>
            <p className="text-pretty text-base text-canopy-foreground/75 md:text-lg">Your soil companion is ready.</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-canopy-foreground/55">Selected field</dt>
              <dd className="mt-1 font-display font-semibold">{field.name} · {field.crop}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-canopy-foreground/55">Soil type</dt>
              <dd className="mt-1 font-display font-semibold">{field.soilType}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-canopy-foreground/55">Last reading</dt>
              <dd className="mt-1 font-display font-semibold">{format(latest.timestamp, 'hh:mm:ss a')}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-canopy-foreground/55">Overall soil</dt>
              <dd className="mt-1 flex items-center gap-2 font-display font-semibold">
                <span className={cn('size-2 rounded-full', STATUS_DOT[overall])} />
                {statusLabel(overall)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="rounded-full bg-canopy-foreground text-canopy hover:bg-canopy-foreground/90"
              render={<Link href="/assistant" />}
            >
              <Sparkles data-icon="inline-start" />
              Ask Kisan Sahayak
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-canopy-foreground hover:bg-canopy-foreground/10 hover:text-canopy-foreground"
              render={<Link href="/parameters" />}
            >
              View telemetry
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-5 md:flex-col md:items-end">
          <HealthRing score={score} status={overall} />
          <div className="flex flex-col gap-2 text-xs text-canopy-foreground/80 md:items-end">
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="size-3.5" /> {data!.device.controller.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Radio className="size-3.5" /> {PARAMETERS.n.short}·{PARAMETERS.p.short}·{PARAMETERS.k.short} 7-in-1 probe
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
