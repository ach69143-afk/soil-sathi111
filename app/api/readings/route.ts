import { NextResponse } from 'next/server'
import { getDeviceStatus, getLatest, getSeries, FIELDS } from '@/lib/soil/mock-source'
import type { FieldId, TimeRange } from '@/lib/soil/types'

const TIME_RANGES: TimeRange[] = ['1H', '6H', '24H', '7D']

/**
 * GET /api/readings?fieldId=field-a&range=24H
 *
 * Returns the latest reading, the telemetry series and device status for a field.
 * Backed by the mock source today; swap `lib/soil/mock-source.ts` for a database
 * query once ESP32 devices are posting to POST /api/readings.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fieldId = (searchParams.get('fieldId') ?? 'field-a') as FieldId
  const range = (searchParams.get('range') ?? '24H') as TimeRange

  if (!FIELDS.some((f) => f.id === fieldId)) {
    return NextResponse.json({ error: 'Unknown fieldId' }, { status: 400 })
  }
  if (!TIME_RANGES.includes(range)) {
    return NextResponse.json({ error: 'Unknown range' }, { status: 400 })
  }

  return NextResponse.json({
    latest: getLatest(fieldId),
    series: getSeries(fieldId, range),
    device: getDeviceStatus(fieldId),
  })
}

/**
 * POST /api/readings
 *
 * Ingestion endpoint for ESP32 devices. Validates the payload shape and returns
 * 202 Accepted. Persisting to a database is the next step in the pipeline.
 *
 * Expected body:
 * { deviceId: string, fieldId: FieldId, n: number, p: number, k: number,
 *   moisture: number, temperature: number, ph: number, timestamp?: string }
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const required = ['deviceId', 'fieldId', 'n', 'p', 'k', 'moisture', 'temperature', 'ph'] as const
  const record = body as Record<string, unknown>
  const missing = required.filter((key) => record?.[key] === undefined)
  if (missing.length) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 422 })
  }
  const numeric = ['n', 'p', 'k', 'moisture', 'temperature', 'ph']
  const invalid = numeric.filter((key) => typeof record[key] !== 'number' || !Number.isFinite(record[key]))
  if (invalid.length) {
    return NextResponse.json({ error: `Non-numeric values: ${invalid.join(', ')}` }, { status: 422 })
  }

  // TODO: persist to database (e.g. Neon) here.
  return NextResponse.json({ accepted: true, receivedAt: new Date().toISOString() }, { status: 202 })
}
