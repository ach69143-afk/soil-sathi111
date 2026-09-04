'use client'

import useSWR from 'swr'
import { getDeviceStatus, getLatest, getSeries } from './mock-source'
import type { DeviceStatus, FieldId, SensorReading, TimeRange } from './types'

export interface ReadingsPayload {
  latest: SensorReading
  series: SensorReading[]
  device: DeviceStatus
}

/**
 * Returns live readings for a field, refreshing every 5 seconds.
 *
 * Currently backed by the mock source (client-side). When a real backend is
 * available, swap the fetcher for an API call to POST /api/readings.
 */
export function useReadings(fieldId: FieldId, range: TimeRange = '24H') {
  return useSWR<ReadingsPayload>(
    `readings:${fieldId}:${range}`,
    () => ({
      latest: getLatest(fieldId),
      series: getSeries(fieldId, range),
      device: getDeviceStatus(fieldId),
    }),
    {
      fallbackData: {
        latest: getLatest(fieldId),
        series: getSeries(fieldId, range),
        device: getDeviceStatus(fieldId),
      },
      refreshInterval: 5_000,
      keepPreviousData: false,
    },
  )
}
