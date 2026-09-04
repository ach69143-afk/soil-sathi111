import type { Crop, ParameterKey, ParameterMeta, Range, SoilType, Status, ThresholdProfile } from './types'

/**
 * Parameter metadata: units, gauge/axis bounds, plain-language descriptions.
 */
export const PARAMETERS: Record<ParameterKey, ParameterMeta> = {
  n: {
    key: 'n',
    label: 'Nitrogen',
    short: 'N',
    unit: 'mg/kg',
    description: 'Supports healthy vegetative growth and leaf development.',
    axis: { min: 0, max: 300 },
    decimals: 0,
  },
  p: {
    key: 'p',
    label: 'Phosphorus',
    short: 'P',
    unit: 'mg/kg',
    description: 'Drives root establishment, flowering and energy transfer.',
    axis: { min: 0, max: 120 },
    decimals: 0,
  },
  k: {
    key: 'k',
    label: 'Potassium',
    short: 'K',
    unit: 'mg/kg',
    description: 'Regulates water use, disease resistance and grain quality.',
    axis: { min: 0, max: 400 },
    decimals: 0,
  },
  moisture: {
    key: 'moisture',
    label: 'Soil Moisture',
    short: 'Moisture',
    unit: '%',
    description: 'Volumetric water content in the root zone.',
    axis: { min: 0, max: 100 },
    decimals: 0,
  },
  temperature: {
    key: 'temperature',
    label: 'Soil Temperature',
    short: 'Temp',
    unit: '°C',
    description: 'Root-zone temperature affecting germination and microbial activity.',
    axis: { min: 5, max: 45 },
    decimals: 1,
  },
  ph: {
    key: 'ph',
    label: 'Soil pH',
    short: 'pH',
    unit: '',
    description: 'Acidity or alkalinity, which controls nutrient availability.',
    axis: { min: 4, max: 10 },
    decimals: 1,
  },
}

/**
 * Threshold profiles keyed by crop + soil type + region.
 * These are illustrative agronomic ranges for demo purposes; a production system
 * should load these from a database and let an agronomist edit them per location.
 */
export const THRESHOLD_PROFILES: ThresholdProfile[] = [
  {
    id: 'wheat-alluvial-up',
    crop: 'Wheat',
    soilType: 'Alluvial Loam',
    region: 'Western Uttar Pradesh',
    source: 'State agri-university advisory (demo)',
    ranges: {
      n: { min: 120, max: 180 },
      p: { min: 40, max: 70 },
      k: { min: 150, max: 250 },
      moisture: { min: 45, max: 65 },
      temperature: { min: 15, max: 28 },
      ph: { min: 6.2, max: 7.5 },
    },
  },
  {
    id: 'rice-clay-up',
    crop: 'Rice Paddy',
    soilType: 'Clay Loam',
    region: 'Western Uttar Pradesh',
    source: 'State agri-university advisory (demo)',
    ranges: {
      n: { min: 140, max: 220 },
      p: { min: 35, max: 65 },
      k: { min: 160, max: 260 },
      moisture: { min: 70, max: 95 },
      temperature: { min: 22, max: 34 },
      ph: { min: 5.5, max: 7.0 },
    },
  },
  {
    id: 'sugarcane-black-up',
    crop: 'Sugarcane',
    soilType: 'Black Cotton (Vertisol)',
    region: 'Western Uttar Pradesh',
    source: 'State agri-university advisory (demo)',
    ranges: {
      n: { min: 160, max: 240 },
      p: { min: 45, max: 80 },
      k: { min: 200, max: 320 },
      moisture: { min: 55, max: 75 },
      temperature: { min: 20, max: 34 },
      ph: { min: 6.0, max: 7.8 },
    },
  },
  {
    id: 'veg-sandy-up',
    crop: 'Vegetables',
    soilType: 'Sandy Loam',
    region: 'Western Uttar Pradesh',
    source: 'State agri-university advisory (demo)',
    ranges: {
      n: { min: 130, max: 200 },
      p: { min: 50, max: 90 },
      k: { min: 180, max: 280 },
      moisture: { min: 50, max: 70 },
      temperature: { min: 18, max: 30 },
      ph: { min: 6.0, max: 7.0 },
    },
  },
]

export function getProfile(crop: Crop, soilType: SoilType): ThresholdProfile {
  return (
    THRESHOLD_PROFILES.find((p) => p.crop === crop && p.soilType === soilType) ??
    THRESHOLD_PROFILES.find((p) => p.crop === crop) ??
    THRESHOLD_PROFILES[0]
  )
}

export function evaluate(value: number, range: Range): Status {
  const span = range.max - range.min
  if (value < range.min - span * 0.35 || value > range.max + span * 0.35) return 'critical'
  if (value < range.min) return 'low'
  if (value > range.max) return 'high'
  return 'good'
}

export function statusLabel(status: Status): string {
  switch (status) {
    case 'good':
      return 'Good'
    case 'low':
      return 'Low'
    case 'high':
      return 'High'
    case 'critical':
      return 'Attention'
  }
}

export function overallStatus(statuses: Status[]): Status {
  if (statuses.includes('critical')) return 'critical'
  const offCount = statuses.filter((s) => s !== 'good').length
  if (offCount >= 3) return 'critical'
  if (offCount >= 1) return statuses.find((s) => s !== 'good') ?? 'good'
  return 'good'
}

export function healthScore(values: Record<ParameterKey, number>, profile: ThresholdProfile): number {
  const keys = Object.keys(values) as ParameterKey[]
  const scores = keys.map((k) => {
    const r = profile.ranges[k]
    const v = values[k]
    if (v >= r.min && v <= r.max) return 100
    const span = r.max - r.min
    const dist = v < r.min ? r.min - v : v - r.max
    return Math.max(0, 100 - (dist / span) * 120)
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
