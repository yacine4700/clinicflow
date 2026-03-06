import { fr } from './fr'
import { en } from './en'
import { ar } from './ar'
import type { Translations } from './types'

export type Language = 'fr' | 'en' | 'ar'
export type { Translations } from './types'

export const LANGUAGES: { code: Language; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
]

export const translations: Record<Language, Translations> = { fr, en, ar }

export function getTranslations(lang: Language = 'fr'): Translations {
  return translations[lang] ?? fr
}
