'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shell/page-header'
import { useField } from '@/components/soil/field-provider'
import { getHistory } from '@/lib/soil/mock-source'
import { PARAMETERS, statusLabel } from '@/lib/soil/thresholds'
import { StatusBadge } from '@/components/soil/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FIELDS } from '@/lib/soil/mock-source'

export default function HistoryPage() {
  const { field } = useField()
  const entries = getHistory(field.id)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Soil test history"
        title="Past Readings"
        description={`Historical sensor and lab results for ${field.name}`}
      />

      <div className="overflow-x-auto rounded-xl border bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">N</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">K</TableHead>
              <TableHead className="text-right">Moisture</TableHead>
              <TableHead className="text-right">Temp</TableHead>
              <TableHead className="text-right">pH</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium tabular">
                  {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={entry.method === 'Lab' ? 'secondary' : 'outline'} className="rounded-full text-[10px]">
                    {entry.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular">{entry.n}</TableCell>
                <TableCell className="text-right tabular">{entry.p}</TableCell>
                <TableCell className="text-right tabular">{entry.k}</TableCell>
                <TableCell className="text-right tabular">{entry.moisture}%</TableCell>
                <TableCell className="text-right tabular">{entry.temperature}°C</TableCell>
                <TableCell className="text-right tabular">{entry.ph}</TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={entry.overall} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
