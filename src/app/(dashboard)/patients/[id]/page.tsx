// src/app/(dashboard)/patients/[id]/page.tsx
import { getPatientById } from '@/lib/actions/patients'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { PatientProfile } from '@/components/patients/patient-profile'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const patient = await getPatientById(params.id)
  if (!patient) return { title: 'Patient Not Found' }
  return { title: `${patient.firstName} ${patient.lastName}` }
}

export default async function PatientPage({ params }: { params: { id: string } }) {
  const [patient, session] = await Promise.all([
    getPatientById(params.id),
    auth(),
  ])

  if (!patient) notFound()

  return (
    <PatientProfile
      patient={patient as any}
      isDoctor={session?.user?.role === 'DOCTOR'}
    />
  )
}
