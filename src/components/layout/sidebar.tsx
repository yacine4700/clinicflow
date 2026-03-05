// src/components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Clock, FileText, DollarSign,
  Settings, Heart, FilePlus, ChevronRight
} from 'lucide-react'

type Role = 'DOCTOR' | 'SECRETARY'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: Role[]
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Waiting Room', href: '/waiting-room', icon: Clock },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Prescriptions', href: '/prescriptions', icon: FilePlus, roles: ['DOCTOR'] },
  { label: 'Documents', href: '/documents', icon: FileText, roles: ['DOCTOR'] },
  { label: 'Finance', href: '/finance', icon: DollarSign, roles: ['DOCTOR'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['DOCTOR'] },
]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(role))

  return (
    <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground leading-tight">ClinicFlow</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{role === 'DOCTOR' ? 'Doctor Panel' : 'Secretary'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary-foreground' : '')} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom role badge */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium',
          role === 'DOCTOR' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
        )}>
          <div className={cn('w-1.5 h-1.5 rounded-full', role === 'DOCTOR' ? 'bg-emerald-500' : 'bg-sky-500')} />
          {role === 'DOCTOR' ? '🩺 Doctor Access' : '📋 Secretary Access'}
        </div>
      </div>
    </aside>
  )
}
