// src/app/(dashboard)/prescriptions/new/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatients } from '@/lib/actions/patients'
import { getTemplates } from '@/lib/actions/prescriptions'
import { getClinicSettings } from '@/lib/actions/finance'
import { PrescriptionEditor } from '@/components/prescriptions/prescription-editor'


export default async function NewPrescriptionPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'DOCTOR') redirect('/dashboard')

  const { patientId } = await searchParams
  const [patients, templates] = await Promise.all([
    getPatients(),
    getTemplates(),
  ])

  return (
    <PrescriptionEditor
      patients={patients as any}
      templates={templates as any}
      doctorName={session.user.name}
      defaultPatientId={patientId}
    />
  )
}
