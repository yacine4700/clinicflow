'use client'

import { signOut } from 'next-auth/react'
import { getInitials } from '@/lib/utils'
import { LogOut, Bell, Globe } from 'lucide-react'
import { useApp, useT } from '@/components/providers/app-provider'
import { LANGUAGES } from '@/lib/i18n'
import type { Language } from '@/lib/i18n'
import { updateClinicSettings } from '@/lib/actions/finance'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  user: { id: string; name: string; email: string; role: string }
}

export function TopBar({ user }: TopBarProps) {
  const t = useT()
  const { language, setConfig } = useApp()
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleLanguageChange = async (lang: Language) => {
    setConfig({ language: lang })
    setShowLangMenu(false)
    updateClinicSettings({ language: lang }).catch(() => {})
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {user.role === 'DOCTOR' ? t('nav.doctorPanel') : t('nav.secretary')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            {currentLang?.label}
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors',
                      language === lang.code ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                    )}
                  >
                    {lang.label}
                    {lang.dir === 'rtl' && <span className="text-xs text-muted-foreground ms-auto">RTL</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ps-2 border-s border-border">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('common.signOut')}
          </button>
        </div>
      </div>
    </header>
  )
}
