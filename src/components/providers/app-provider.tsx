'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Language, Messages } from '@/lib/i18n'
import { getMessages, LANGUAGES, interpolate } from '@/lib/i18n'
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
  m: Messages
  // Translate a dot-notation key with optional variable interpolation
  // e.g. t('finance.toast.paymentRecorded', { amount: '$50' })
  t: (key: string, vars?: Record<string, string | number>) => string
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

// Convenience hook – just the translator function
export function useT() {
  return useApp().t
}

// Convenience hook – just the messages object (for section access)
export function useMessages() {
  return useApp().m
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

  const m = getMessages(config.language)
  const dir = LANGUAGES.find(l => l.code === config.language)?.dir ?? 'ltr'
  const fmt = useCallback((amount: number) => baseFmt(amount, config.currency), [config.currency])

  // Translate key with optional interpolation
  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    const parts = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = m
    for (const part of parts) {
      if (val == null) return key
      val = val[part]
    }
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val !== 'string') return key
    return interpolate(val, vars)
  }, [m])

  // Sync html dir + lang for RTL support
  useEffect(() => {
    document.documentElement.setAttribute('lang', config.language)
    document.documentElement.setAttribute('dir', dir)
  }, [config.language, dir])

  // Dynamic favicon from logo
  useEffect(() => {
    updateFavicon(config.logo || '/favicon.ico')
  }, [config.logo])

  const value: AppContextValue = {
    currency: config.currency,
    language: config.language,
    logo: config.logo,
    m,
    t,
    dir,
    fmt,
    setConfig,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function updateFavicon(href: string) {
  document.querySelectorAll('link[data-dynamic-favicon]').forEach(el => el.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.setAttribute('data-dynamic-favicon', 'true')
  link.href = href
  document.head.appendChild(link)
}
