'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useField } from './field-provider'
import type { FieldId } from '@/lib/soil/types'
import { Wheat } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FieldSelector({ className }: { className?: string }) {
  const { fields, fieldId, setFieldId } = useField()
  return (
    <Select value={fieldId} onValueChange={(v) => v && setFieldId(v as FieldId)}>
      <SelectTrigger aria-label="Select field" className={cn('h-9 rounded-full bg-card pl-3 shadow-xs', className)}>
        <Wheat className="text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {fields.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span className="font-medium">{f.name}</span>
              <span className="text-muted-foreground">— {f.crop}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
