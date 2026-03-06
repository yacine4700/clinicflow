// src/app/layout.tsx
import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'ClinicFlow',
  description: 'Modern medical clinic management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
