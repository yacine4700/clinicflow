// src/components/layout/topbar.tsx
'use client'

import { signOut } from 'next-auth/react'
import { getInitials } from '@/lib/utils'
import { LogOut, Bell } from 'lucide-react'

interface TopBarProps {
  user: { id: string; name: string; email: string; role: string }
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role === 'DOCTOR' ? 'Physician' : 'Administrative Staff'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
