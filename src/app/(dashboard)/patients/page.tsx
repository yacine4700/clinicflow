// src/app/(dashboard)/patients/page.tsx
import { getPatients } from '@/lib/actions/patients'
import { PatientsClient } from '@/components/patients/patients-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Patients' }
export const dynamic = 'force-dynamic'

export default async function PatientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const patients = await getPatients(searchParams.q)

  return <PatientsClient patients={patients as any} searchQuery={searchParams.q || ''} />
}
