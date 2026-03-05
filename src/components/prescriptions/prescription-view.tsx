// src/components/prescriptions/prescription-view.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, FilePlus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PrescriptionViewProps {
  prescription: {
    id: string
    date: Date
    diagnosis: string | null
    notes: string | null
    doctor: { name: string }
    patient: {
      firstName: string; lastName: string; dateOfBirth: Date | null
      gender: string | null; phone: string | null
    }
    items: {
      id: string; drugName: string; dosage: string
      frequency: string; duration: string; instructions: string | null; order: number
    }[]
  }
  settings: {
    clinicName: string; doctorName: string; doctorSpecialty?: string
    address?: string; phone?: string; prescriptionHeader?: string; prescriptionFooter?: string
  } | null
}

export function PrescriptionView({ prescription, settings }: PrescriptionViewProps) {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Toolbar - hidden on print */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-2">
          <a
            href={`/api/print/prescription/${prescription.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print PDF
          </a>
        </div>
      </div>

      {/* Printable Prescription */}
      <div id="prescription-print" className="clinic-card overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{settings?.clinicName || 'Medical Clinic'}</h1>
              <p className="text-sky-100 text-sm mt-0.5">{settings?.doctorName || prescription.doctor.name}</p>
              {settings?.doctorSpecialty && (
                <p className="text-sky-200 text-xs mt-0.5">{settings.doctorSpecialty}</p>
              )}
            </div>
            <div className="text-right text-sm">
              {settings?.address && <p className="text-sky-100">{settings.address}</p>}
              {settings?.phone && <p className="text-sky-100">{settings.phone}</p>}
              <p className="text-sky-200 text-xs mt-1">Prescription #{prescription.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Patient + Date Info */}
        <div className="grid grid-cols-2 gap-4 p-5 bg-muted/30 border-b border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Patient</p>
            <p className="font-semibold text-foreground mt-0.5">
              {prescription.patient.firstName} {prescription.patient.lastName}
            </p>
            {prescription.patient.dateOfBirth && (
              <p className="text-sm text-muted-foreground">DOB: {formatDate(prescription.patient.dateOfBirth)}</p>
            )}
            {prescription.patient.phone && (
              <p className="text-sm text-muted-foreground">{prescription.patient.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</p>
            <p className="font-semibold text-foreground mt-0.5">{formatDate(prescription.date)}</p>
            {prescription.diagnosis && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">Diagnosis</p>
                <p className="text-sm text-foreground">{prescription.diagnosis}</p>
              </>
            )}
          </div>
        </div>

        {/* Rx Symbol + Medications */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-4xl font-bold text-sky-600" style={{ fontFamily: 'serif' }}>℞</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-4">
            {prescription.items.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 pb-4 border-b border-border last:border-0">
                  <div className="flex items-baseline justify-between">
                    <p className="font-bold text-foreground text-lg">{item.drugName}</p>
                    <p className="text-sm font-medium text-sky-600">{item.dosage}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Frequency:</span> {item.frequency}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Duration:</span> {item.duration}
                    </span>
                  </div>
                  {item.instructions && (
                    <p className="text-sm text-muted-foreground mt-1 italic">↳ {item.instructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {prescription.notes && (
            <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Doctor's Notes</p>
              <p className="text-sm text-foreground">{prescription.notes}</p>
            </div>
          )}
        </div>

        {/* Signature Area */}
        <div className="px-6 pb-6">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="w-48 h-16 border-b-2 border-foreground mb-1" />
              <p className="text-sm font-medium text-foreground">{prescription.doctor.name}</p>
              {settings?.doctorSpecialty && (
                <p className="text-xs text-muted-foreground">{settings.doctorSpecialty}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-3 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            {settings?.prescriptionFooter || 'This prescription is valid for 30 days from the date of issue.'}
          </p>
        </div>
      </div>
    </div>
  )
}
