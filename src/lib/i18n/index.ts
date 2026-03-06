// src/lib/i18n/index.ts
// Professional i18n engine: JSON messages, typed dot-notation, interpolation

import fr from '../../../messages/fr.json'
import en from '../../../messages/en.json'
import ar from '../../../messages/ar.json'

export type Language = 'fr' | 'en' | 'ar'

export type Messages = typeof fr

export const LANGUAGES: { code: Language; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English',  dir: 'ltr' },
  { code: 'ar', label: 'العربية',  dir: 'rtl' },
]

const allMessages: Record<Language, Messages> = {
  fr: fr as Messages,
  en: en as Messages,
  ar: ar as Messages,
}

export function getMessages(lang: Language): Messages {
  return allMessages[lang] ?? allMessages.fr
}

// Interpolate {vars} in a string
export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}
