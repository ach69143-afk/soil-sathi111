'use client'

import * as React from 'react'
import { MapPin, Wheat, Ruler, Calendar, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shell/page-header'
import { useField } from '@/components/soil/field-provider'
import { FIELDS, FARMER } from '@/lib/soil/mock-source'
import { cn } from '@/lib/utils'

export default function FieldsPage() {
  const { field, setFieldId } = useField()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Field management"
        title="Your Fields"
        description={`${FARMER.name}'s registered fields in ${FARMER.village}, ${FARMER.district}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {FIELDS.map((f) => {
          const isActive = f.id === field.id
          return (
            <Card
              key={f.id}
              className={cn(
                'cursor-pointer gap-0 py-0 transition-all hover:shadow-md',
                isActive && 'ring-2 ring-primary shadow-md',
              )}
              onClick={() => setFieldId(f.id)}
            >
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg">{f.name}</CardTitle>
                  {isActive && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <span className="pulse-ring relative size-1.5 rounded-full bg-primary text-primary" />
                      Active
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-5 pb-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wheat className="size-4 text-primary" />
                    <span className="font-medium text-foreground">{f.crop}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{f.soilType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="size-4" />
                    <span>{f.sizeAcres} acres</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Sown {new Date(f.sownOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Cpu className="size-3.5" />
                    {f.deviceId}
                  </span>
                  <span className="font-semibold text-foreground">{f.stage}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
