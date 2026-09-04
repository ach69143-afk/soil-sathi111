'use client'

import * as React from 'react'
import { FIELDS } from '@/lib/soil/mock-source'
import type { Field, FieldId } from '@/lib/soil/types'

interface FieldContextValue {
  fields: Field[]
  field: Field
  fieldId: FieldId
  setFieldId: (id: FieldId) => void
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

export function FieldProvider({ children }: { children: React.ReactNode }) {
  const [fieldId, setFieldId] = React.useState<FieldId>('field-a')
  const field = React.useMemo(() => FIELDS.find((f) => f.id === fieldId) ?? FIELDS[0], [fieldId])

  const value = React.useMemo(() => ({ fields: FIELDS, field, fieldId, setFieldId }), [field, fieldId])

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

export function useField() {
  const ctx = React.useContext(FieldContext)
  if (!ctx) throw new Error('useField must be used within FieldProvider')
  return ctx
}
