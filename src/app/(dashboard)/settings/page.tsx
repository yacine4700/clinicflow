// src/app/(dashboard)/settings/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getClinicSettings } from '@/lib/actions/finance'
import { getTemplates } from '@/lib/actions/prescriptions'
import { SettingsClient } from '@/components/settings/settings-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user?.role !== 'DOCTOR') redirect('/dashboard')

  const [settings, templates] = await Promise.all([
    getClinicSettings(),
    getTemplates(),
  ])

  return <SettingsClient settings={settings as any} templates={templates as any} />
}
