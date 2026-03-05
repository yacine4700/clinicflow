// src/app/(dashboard)/prescriptions/[id]/page.tsx
import { getPrescription } from '@/lib/actions/prescriptions'
import { getClinicSettings } from '@/lib/actions/finance'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { PrescriptionView } from '@/components/prescriptions/prescription-view'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Prescription' }

export default async function PrescriptionPage({ params }: { params: { id: string } }) {
  const [prescription, settings, session] = await Promise.all([
    getPrescription(params.id),
    getClinicSettings(),
    auth(),
  ])

  if (!prescription) notFound()

  return <PrescriptionView prescription={prescription as any} settings={settings as any} />
}
