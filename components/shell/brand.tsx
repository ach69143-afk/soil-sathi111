import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V11" />
        <path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7Z" />
        <path d="M12 15c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" />
        <path d="M4 21h16" />
      </svg>
    </span>
  )
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-[0.12em] text-foreground">SOIL SATHI</span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">Smart Soil & NPK Advisory</span>
        </div>
      )}
    </div>
  )
}
