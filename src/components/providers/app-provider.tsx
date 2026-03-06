'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Language, Translations } from '@/lib/i18n'
import { getTranslations, LANGUAGES } from '@/lib/i18n'
import { formatCurrency as baseFmt } from '@/lib/utils'

interface AppConfig {
  currency: string
  language: Language
  logo: string | null
}

interface AppContextValue {
  currency: string
  language: Language
  logo: string | null
  t: Translations
  dir: 'ltr' | 'rtl'
  fmt: (amount: number) => string
  setConfig: (patch: Partial<AppConfig>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

// Convenience hook – just the translator
export function useT(): Translations {
  return useApp().t
}

// Convenience hook – just currency formatter
export function useFmt(): (amount: number) => string {
  return useApp().fmt
}

interface Props {
  children: React.ReactNode
  initialCurrency: string
  initialLanguage: Language
  initialLogo: string | null
}

export function AppProvider({ children, initialCurrency, initialLanguage, initialLogo }: Props) {
  const [config, setConfigState] = useState<AppConfig>({
    currency: initialCurrency,
    language: initialLanguage,
    logo: initialLogo,
  })

  const setConfig = useCallback((patch: Partial<AppConfig>) => {
    setConfigState(prev => ({ ...prev, ...patch }))
  }, [])

  const t = getTranslations(config.language)
  const dir = LANGUAGES.find(l => l.code === config.language)?.dir ?? 'ltr'
  const fmt = useCallback((amount: number) => baseFmt(amount, config.currency), [config.currency])

  // Sync html dir + lang attribute for RTL (Arabic) support
  useEffect(() => {
    document.documentElement.setAttribute('lang', config.language)
    document.documentElement.setAttribute('dir', dir)
  }, [config.language, dir])

  // Dynamic favicon from logo
  useEffect(() => {
    if (!config.logo) {
      // Restore default favicon
      updateFavicon('/favicon.ico')
      return
    }
    updateFavicon(config.logo)
  }, [config.logo])

  const value: AppContextValue = {
    currency: config.currency,
    language: config.language,
    logo: config.logo,
    t,
    dir,
    fmt,
    setConfig,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function updateFavicon(href: string) {
  // Remove existing dynamic favicons
  document.querySelectorAll('link[data-dynamic-favicon]').forEach(el => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.setAttribute('data-dynamic-favicon', 'true')
  link.href = href
  document.head.appendChild(link)
}
