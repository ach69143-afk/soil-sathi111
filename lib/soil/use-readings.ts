'use client'

import useSWR from 'swr'
import { getDeviceStatus, getLatest, getSeries } from './mock-source'
import type { DeviceStatus, FieldId, SensorReading, TimeRange } from './types'

export interface ReadingsPayload {
  latest: SensorReading
  series: SensorReading[]
  device: DeviceStatus
}

const fetcher = async (url: string): Promise<ReadingsPayload> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load readings')
  return res.json()
}

/**
 * Fetches readings from /api/readings and keeps them fresh.
 * `fallbackData` is computed synchronously from the same mock source so the
 * first paint is never empty; once the API is DB-backed, drop the fallback.
 */
export function useReadings(fieldId: FieldId, range: TimeRange = '24H') {
  return useSWR<ReadingsPayload>(`/api/readings?fieldId=${fieldId}&range=${range}`, fetcher, {
    fallbackData: {
      latest: getLatest(fieldId),
      series: getSeries(fieldId, range),
      device: getDeviceStatus(fieldId),
    },
    refreshInterval: 30_000,
    keepPreviousData: true,
  })
}
