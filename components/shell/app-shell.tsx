'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav'
import { BrandLockup, BrandMark } from './brand'
import { FieldSelector } from '@/components/soil/field-selector'
import { useField } from '@/components/soil/field-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FARMER } from '@/lib/soil/mock-source'
import { MapPin } from 'lucide-react'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { field } = useField()

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link href="/" aria-label="SOIL SATHI home">
            <BrandLockup />
          </Link>
        </div>
        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3 pt-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  active && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
                )}
              >
                <item.icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mx-3 mb-4 rounded-2xl bg-canopy p-4 text-canopy-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-canopy-foreground/60">Active field</p>
          <p className="mt-1 font-display text-base font-semibold">{field.name} · {field.crop}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-canopy-foreground/70">
            <MapPin className="size-3.5" /> {FARMER.village}, {FARMER.district}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 md:h-16 md:px-6 lg:px-8">
          <Link href="/" className="lg:hidden" aria-label="SOIL SATHI home">
            <BrandMark className="size-8" />
          </Link>
          <div className="hidden min-w-0 flex-col md:flex">
            <p className="truncate text-xs text-muted-foreground">
              {FARMER.village}, {FARMER.district}, {FARMER.state}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <FieldSelector />
            <Link href="/profile" aria-label="Open profile">
              <Avatar className="size-9 ring-2 ring-background">
                <AvatarFallback className="bg-earth text-earth-foreground text-sm font-semibold">
                  {FARMER.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 md:px-6 md:pt-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary mobile"
        className="glass fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors',
                    active && 'text-primary',
                  )}
                >
                  <span className={cn('flex h-7 w-11 items-center justify-center rounded-full transition-colors', active && 'bg-accent')}>
                    <item.icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  {item.short}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
