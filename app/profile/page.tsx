'use client'

import { User, Phone, MapPin, Calendar, Globe, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shell/page-header'
import { FARMER, FIELDS } from '@/lib/soil/mock-source'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Icon className="size-[18px]" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account information and registered devices"
      />

      <div className="mx-auto grid w-full max-w-2xl gap-6">
        {/* Farmer info */}
        <Card className="gap-0 py-0">
          <CardHeader className="items-center px-5 pt-6 pb-4">
            <Avatar className="size-16" size="lg">
              <AvatarFallback className="bg-earth text-earth-foreground text-xl font-bold">
                {FARMER.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3 font-display text-xl">{FARMER.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{FARMER.village}, {FARMER.district}</p>
          </CardHeader>
          <CardContent className="flex flex-col px-5 pb-5">
            <Separator />
            <InfoRow icon={MapPin} label="Location" value={`${FARMER.village}, ${FARMER.district}, ${FARMER.state}`} />
            <Separator />
            <InfoRow icon={Phone} label="Phone" value={FARMER.phone} />
            <Separator />
            <InfoRow icon={Globe} label="Language" value={FARMER.language} />
            <Separator />
            <InfoRow icon={Calendar} label="Member since" value={new Date(FARMER.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
          </CardContent>
        </Card>

        {/* Registered devices */}
        <Card className="gap-0 py-0">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="font-display text-base">Registered Devices</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-5 pb-5">
            {FIELDS.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Cpu className="size-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{f.deviceId}</p>
                    <p className="text-xs text-muted-foreground">{f.name} · {f.crop}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-good">
                  <span className="pulse-ring relative size-1.5 rounded-full bg-status-good text-status-good" />
                  Active
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
