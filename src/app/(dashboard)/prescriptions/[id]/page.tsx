// src/app/(dashboard)/prescriptions/[id]/page.tsx
import { getPrescription } from '@/lib/actions/prescriptions'
import { getClinicSettings } from '@/lib/actions/finance'
import { notFound } from 'next/navigation'
import { PrescriptionView } from '@/components/prescriptions/prescription-view'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Prescription' }

export default async function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [prescription, settings] = await Promise.all([
    getPrescription(id),
    getClinicSettings(),
  ])

  if (!prescription) notFound()

  return <PrescriptionView prescription={prescription as any} settings={settings as any} />
}
