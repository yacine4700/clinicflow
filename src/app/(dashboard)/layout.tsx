// src/app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { AppProvider } from '@/components/providers/app-provider'
import { getClinicSettings } from '@/lib/actions/finance'
import type { Language } from '@/lib/i18n'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const settings = await getClinicSettings()

  return (
    <AppProvider
      initialCurrency={settings?.currency ?? 'USD'}
      initialLanguage={(settings?.language as Language) ?? 'fr'}
      initialLogo={settings?.logo ?? null}
    >
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar role={session.user.role as 'DOCTOR' | 'SECRETARY'} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar user={session.user} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
