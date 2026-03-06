import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'ClinicFlow',
  description: 'Modern medical clinic management system',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
