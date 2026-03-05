// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: {
    template: '%s | ClinicFlow',
    default: 'ClinicFlow — Medical Clinic Management',
  },
  description: 'Modern medical clinic management system for doctors and staff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
