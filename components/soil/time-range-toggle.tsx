'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { TimeRange } from '@/lib/soil/types'

const RANGES: TimeRange[] = ['1H', '6H', '24H', '7D']

export function TimeRangeToggle({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => {
        const next = (v as TimeRange[])[0]
        if (next) onChange(next)
      }}
      size="sm"
      spacing={1}
      aria-label="Time range"
      className="rounded-full border bg-card p-0.5"
    >
      {RANGES.map((r) => (
        <ToggleGroupItem
          key={r}
          value={r}
          className="min-w-11 rounded-full px-3 font-semibold tabular text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm hover:aria-pressed:bg-primary hover:aria-pressed:text-primary-foreground"
        >
          {r}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
