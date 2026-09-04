/**
 * Core domain types for SOIL SATHI.
 *
 * Data flow (target architecture):
 *   ESP32 + NPK sensor  →  POST /api/readings  →  Database  →  GET /api/readings  →  Dashboard
 *
 * Today the API route serves deterministic mock data from `lib/soil/mock-source.ts`.
 * Swap the source module for a DB-backed implementation without touching the UI.
 */

export type FieldId = 'field-a' | 'field-b' | 'field-c' | 'field-d'

export type Crop = 'Wheat' | 'Rice Paddy' | 'Sugarcane' | 'Vegetables'

export type SoilType = 'Alluvial Loam' | 'Clay Loam' | 'Black Cotton (Vertisol)' | 'Sandy Loam'

export type ParameterKey = 'n' | 'p' | 'k' | 'moisture' | 'temperature' | 'ph'

export type Status = 'good' | 'low' | 'high' | 'critical'

export type Range = { min: number; max: number }

export type TimeRange = '1H' | '6H' | '24H' | '7D'

export interface Field {
  id: FieldId
  name: string
  crop: Crop
  soilType: SoilType
  sizeAcres: number
  sownOn: string
  stage: string
  deviceId: string
}

export interface Farmer {
  name: string
  village: string
  district: string
  state: string
  phone: string
  memberSince: string
  language: string
}

export interface SensorReading {
  timestamp: string
  fieldId: FieldId
  n: number
  p: number
  k: number
  moisture: number
  temperature: number
  ph: number
}

export interface DeviceStatus {
  controller: { name: string; state: 'connected' | 'offline'; firmware: string; rssi: number; battery: number }
  sensor: { name: string; state: 'active' | 'idle' | 'fault'; model: string }
  lastScanAt: string
  scanIntervalMinutes: number
}

/**
 * Threshold profile — optimal ranges are configurable by crop, soil type and location
 * rather than fixed universal values. Add profiles to `lib/soil/thresholds.ts`.
 */
export interface ThresholdProfile {
  id: string
  crop: Crop
  soilType: SoilType
  region: string
  source: string
  ranges: Record<ParameterKey, Range>
}

export interface ParameterMeta {
  key: ParameterKey
  label: string
  short: string
  unit: string
  description: string
  /** Absolute axis bounds for gauges and charts */
  axis: Range
  decimals: number
}

export interface HistoryEntry extends SensorReading {
  id: string
  overall: Status
  method: 'Sensor' | 'Lab'
}
