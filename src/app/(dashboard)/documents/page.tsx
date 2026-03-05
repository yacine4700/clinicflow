// src/app/(dashboard)/documents/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { getPatients } from '@/lib/actions/patients'
import { DocumentsClient } from '@/components/documents/documents-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Documents' }
export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const session = await auth()
  if (session?.user?.role !== 'DOCTOR') redirect('/dashboard')

  const [documents, patients] = await Promise.all([
    prisma.document.findMany({
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { name: true } },
      },
    }),
    getPatients(),
  ])

  return <DocumentsClient documents={documents as any} patients={patients as any} doctorName={session.user.name} />
}
