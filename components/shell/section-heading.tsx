import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  id?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeading({ id, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-display text-lg font-semibold tracking-tight md:text-xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
