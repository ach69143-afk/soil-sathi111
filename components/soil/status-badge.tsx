import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { statusLabel } from '@/lib/soil/thresholds'
import type { Status } from '@/lib/soil/types'

export const STATUS_CLASS: Record<Status, string> = {
  good: 'bg-status-good/12 text-status-good border-status-good/25',
  low: 'bg-status-warn/15 text-earth border-status-warn/35',
  high: 'bg-status-warn/15 text-earth border-status-warn/35',
  critical: 'bg-status-critical/12 text-status-critical border-status-critical/30',
}

export const STATUS_DOT: Record<Status, string> = {
  good: 'bg-status-good',
  low: 'bg-status-warn',
  high: 'bg-status-warn',
  critical: 'bg-status-critical',
}

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider', STATUS_CLASS[status], className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', STATUS_DOT[status])} />
      {label ?? statusLabel(status)}
    </Badge>
  )
}
