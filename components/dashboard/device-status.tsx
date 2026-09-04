import { BatteryMedium, Cpu, Radio, Wifi, Clock3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { DeviceStatus } from '@/lib/soil/types'
import { cn } from '@/lib/utils'

function Row({ icon: Icon, label, value, ok = true }: { icon: React.ElementType; label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Icon className="size-[18px]" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className={cn('pulse-ring relative size-2 rounded-full', ok ? 'bg-status-good text-status-good' : 'bg-status-critical text-status-critical')} />
        {value}
      </span>
    </div>
  )
}

export function DeviceStatusCard({ device }: { device: DeviceStatus }) {
  const controllerOk = device.controller.state === 'connected'
  const sensorOk = device.sensor.state === 'active'

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="font-display text-base">Device status</CardTitle>
        <CardDescription>Field probe and gateway health</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col px-5 pb-5">
        <Row icon={Cpu} label="ESP32 Controller" value={controllerOk ? 'Connected' : 'Offline'} ok={controllerOk} />
        <Separator />
        <Row icon={Radio} label="NPK Sensor" value={sensorOk ? 'Active & Ready' : 'Fault'} ok={sensorOk} />
        <Separator />
        <Row icon={Clock3} label="Last scan" value="Just now" />
        <Separator />
        <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
          <div className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3">
            <span className="flex items-center gap-1 text-muted-foreground"><Wifi className="size-3.5" /> Signal</span>
            <span className="font-semibold tabular">{device.controller.rssi} dBm</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3">
            <span className="flex items-center gap-1 text-muted-foreground"><BatteryMedium className="size-3.5" /> Battery</span>
            <span className="font-semibold tabular">{device.controller.battery}%</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3">
            <span className="text-muted-foreground">Interval</span>
            <span className="font-semibold tabular">{device.scanIntervalMinutes} min</span>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {device.controller.name} · fw {device.controller.firmware} · {device.sensor.model}
        </p>
      </CardContent>
    </Card>
  )
}
