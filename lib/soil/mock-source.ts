import type {
  DeviceStatus,
  Farmer,
  Field,
  FieldId,
  HistoryEntry,
  ParameterKey,
  SensorReading,
  TimeRange,
} from './types'
import { evaluate, getProfile, overallStatus } from './thresholds'

/**
 * Mock sensor source.
 *
 * This module is the ONLY place that fabricates data. Replace it with a
 * database-backed implementation (same function signatures) once the ESP32
 * is posting readings to `/api/readings`.
 */

export const FARMER: Farmer = {
  name: 'Ashish',
  village: 'Bhainsroli',
  district: 'Meerut',
  state: 'Uttar Pradesh',
  phone: '+91 98XXX XXX42',
  memberSince: '2024-06-12',
  language: 'Hindi / English',
}

export const FIELDS: Field[] = [
  {
    id: 'field-a',
    name: 'Field A',
    crop: 'Wheat',
    soilType: 'Alluvial Loam',
    sizeAcres: 3.2,
    sownOn: '2025-11-18',
    stage: 'Tillering',
    deviceId: 'ESP32-SS-01A',
  },
  {
    id: 'field-b',
    name: 'Field B',
    crop: 'Rice Paddy',
    soilType: 'Clay Loam',
    sizeAcres: 2.5,
    sownOn: '2025-07-02',
    stage: 'Harvested',
    deviceId: 'ESP32-SS-02B',
  },
  {
    id: 'field-c',
    name: 'Field C',
    crop: 'Sugarcane',
    soilType: 'Black Cotton (Vertisol)',
    sizeAcres: 4.8,
    sownOn: '2025-02-20',
    stage: 'Grand growth',
    deviceId: 'ESP32-SS-03C',
  },
  {
    id: 'field-d',
    name: 'Field D',
    crop: 'Vegetables',
    soilType: 'Sandy Loam',
    sizeAcres: 1.1,
    sownOn: '2025-12-05',
    stage: 'Vegetative',
    deviceId: 'ESP32-SS-04D',
  },
]

/** A fixed anchor keeps mock data stable between server and client renders. */
export const ANCHOR = new Date('2026-09-04T09:42:00+05:30').getTime()

/** Baseline "now" values per field — chosen so each field tells a different story. */
const BASELINE: Record<FieldId, Record<ParameterKey, number>> = {
  'field-a': { n: 148, p: 52, k: 186, moisture: 58, temperature: 24.5, ph: 6.8 },
  'field-b': { n: 172, p: 29, k: 205, moisture: 81, temperature: 27.2, ph: 6.1 },
  'field-c': { n: 141, p: 61, k: 288, moisture: 49, temperature: 29.4, ph: 7.9 },
  'field-d': { n: 156, p: 74, k: 231, moisture: 44, temperature: 23.1, ph: 6.4 },
}

/** Deterministic pseudo-random so SSR and client agree. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const RANGE_CONFIG: Record<TimeRange, { points: number; stepMinutes: number }> = {
  '1H': { points: 12, stepMinutes: 5 },
  '6H': { points: 24, stepMinutes: 15 },
  '24H': { points: 24, stepMinutes: 60 },
  '7D': { points: 28, stepMinutes: 360 },
}

const AMPLITUDE: Record<ParameterKey, number> = {
  n: 6,
  p: 3,
  k: 8,
  moisture: 4,
  temperature: 1.6,
  ph: 0.12,
}

export function getSeries(fieldId: FieldId, range: TimeRange, now: number = Date.now()): SensorReading[] {
  const { points, stepMinutes } = RANGE_CONFIG[range]
  const base = BASELINE[fieldId]
  const rand = seeded(fieldId.charCodeAt(6) * 97 + points)
  const out: SensorReading[] = []
  const totalMs = points * stepMinutes * 60_000

  // Optional: align 'now' to a minute boundary so data stays stable between polls within the same minute
  // We'll leave it as actual now so the last reading timestamp increments exactly.
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    const ts = now - totalMs + i * stepMinutes * 60_000
    const hour = new Date(ts).getHours()
    // Diurnal curve for temperature; moisture dips through the day and recovers after irrigation
    const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2)
    const drift = (t - 0.5) * 2 // -1 .. 1

    const reading: SensorReading = {
      timestamp: new Date(ts).toISOString(),
      fieldId,
      n: Math.round(base.n + drift * -AMPLITUDE.n * 0.6 + (rand() - 0.5) * AMPLITUDE.n),
      p: Math.round(base.p + drift * -AMPLITUDE.p * 0.4 + (rand() - 0.5) * AMPLITUDE.p),
      k: Math.round(base.k + drift * AMPLITUDE.k * 0.3 + (rand() - 0.5) * AMPLITUDE.k),
      moisture: Math.round(base.moisture - diurnal * AMPLITUDE.moisture * 0.8 + (rand() - 0.5) * AMPLITUDE.moisture),
      temperature: Math.round((base.temperature + diurnal * AMPLITUDE.temperature * 1.6 + (rand() - 0.5) * AMPLITUDE.temperature) * 10) / 10,
      ph: Math.round((base.ph + (rand() - 0.5) * AMPLITUDE.ph) * 10) / 10,
    }
    out.push(reading)
  }
  return out
}

export function getLatest(fieldId: FieldId, now: number = Date.now()): SensorReading {
  const series = getSeries(fieldId, '1H', now)
  return series[series.length - 1]
}

/** Value change over the last comparable window, for trend arrows. */
export function getTrend(fieldId: FieldId, key: ParameterKey): number {
  const series = getSeries(fieldId, '24H')
  const first = series[0][key]
  const last = series[series.length - 1][key]
  return last - first
}

export function getDeviceStatus(fieldId: FieldId): DeviceStatus {
  const field = FIELDS.find((f) => f.id === fieldId) ?? FIELDS[0]
  return {
    controller: {
      name: field.deviceId,
      state: 'connected',
      firmware: 'v2.4.1',
      rssi: -61,
      battery: 87,
    },
    sensor: { name: 'RS485 NPK 7-in-1', state: 'active', model: 'JXBS-3001-TR' },
    lastScanAt: new Date(ANCHOR).toISOString(),
    scanIntervalMinutes: 5,
  }
}

export function getHistory(fieldId?: FieldId): HistoryEntry[] {
  const rand = seeded(4242)
  const entries: HistoryEntry[] = []
  const fields = fieldId ? FIELDS.filter((f) => f.id === fieldId) : FIELDS

  for (let week = 0; week < 10; week++) {
    for (const field of fields) {
      const base = BASELINE[field.id]
      const profile = getProfile(field.crop, field.soilType)
      const ts = ANCHOR - week * 7 * 24 * 60 * 60_000 - field.id.charCodeAt(6) * 3_600_000
      const jitter = (amp: number) => (rand() - 0.5) * amp * 2
      const reading = {
        n: Math.round(base.n + jitter(14) + week * 1.2),
        p: Math.round(base.p + jitter(6) + week * 0.6),
        k: Math.round(base.k + jitter(16)),
        moisture: Math.round(base.moisture + jitter(8)),
        temperature: Math.round((base.temperature + jitter(2.4) - week * 0.15) * 10) / 10,
        ph: Math.round((base.ph + jitter(0.25)) * 10) / 10,
      }
      const statuses = (Object.keys(reading) as ParameterKey[]).map((k) => evaluate(reading[k], profile.ranges[k]))
      entries.push({
        id: `${field.id}-${week}`,
        fieldId: field.id,
        timestamp: new Date(ts).toISOString(),
        ...reading,
        overall: overallStatus(statuses),
        method: week % 4 === 3 ? 'Lab' : 'Sensor',
      })
    }
  }
  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
