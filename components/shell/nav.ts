import { LayoutDashboard, FlaskConical, History, Map, Sparkles, UserRound, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  short: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { href: '/parameters', label: 'Soil Parameters', short: 'Soil', icon: FlaskConical },
  { href: '/history', label: 'Test History', short: 'History', icon: History },
  { href: '/fields', label: 'Fields', short: 'Fields', icon: Map },
  { href: '/assistant', label: 'Kisan Sahayak AI', short: 'Sahayak', icon: Sparkles },
  { href: '/profile', label: 'Profile', short: 'Profile', icon: UserRound },
]
