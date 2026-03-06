// src/components/patients/patient-profile.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, calculateAge, cn } from '@/lib/utils'
import { useFmt } from '@/components/providers/app-provider'
import { addToWaitingRoom } from '@/lib/actions/patients'
import {
  ArrowLeft, User, Phone, Mail, FileText, Clock, FilePlus,
  DollarSign, AlertCircle, ChevronRight, Plus, Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { RecordPaymentDialog } from '../finance/record-payment-dialog'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  gender: string | null
  phone: string | null
  email: string | null
  bloodType: string | null
  allergies: string[]
  hasFile: boolean
  notes: string | null
  medicalFile: any
  prescriptions: any[]
  payments: any[]
  documents: any[]
}

export function PatientProfile({ patient, isDoctor }: { patient: Patient; isDoctor: boolean }) {
  const router = useRouter()
  const fmt = useFmt()
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'payments' | 'documents'>('overview')
  const [showPayment, setShowPayment] = useState(false)

  const handleAddToQueue = async () => {
    const result = await addToWaitingRoom(patient.id)
    if (result.success) toast.success('Added to waiting room')
    else toast.error(result.error || 'Failed to add')
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prescriptions', label: `Prescriptions (${patient.prescriptions.length})` },
    { id: 'payments', label: `Payments (${patient.payments.length})` },
    { id: 'documents', label: `Documents (${patient.documents.length})` },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Patient Header Card */}
      <div className="clinic-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{patient.firstName} {patient.lastName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {patient.dateOfBirth && (
                  <span className="text-sm text-muted-foreground">{calculateAge(patient.dateOfBirth)} years old</span>
                )}
                {patient.gender && (
                  <span className="text-sm text-muted-foreground capitalize">{patient.gender.toLowerCase()}</span>
                )}
                {patient.bloodType && (
                  <span className="text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                    {patient.bloodType}
                  </span>
                )}
                {patient.hasFile ? (
                  <span className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 px-2 py-0.5 rounded-full">📁 Medical File</span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Walk-in</span>
                )}
              </div>
              {patient.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Allergies: {patient.allergies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAddToQueue}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Add to Queue
            </button>
            {isDoctor && (
              <Link
                href={`/prescriptions/new?patientId=${patient.id}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5" />
                New Rx
              </Link>
            )}
            <button
              onClick={() => setShowPayment(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Payment
            </button>
          </div>
        </div>

        {/* Contact info row */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-border">
          {patient.phone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {patient.phone}
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {patient.email}
            </div>
          )}
          {patient.dateOfBirth && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              Born {formatDate(patient.dateOfBirth)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {patient.medicalFile && (
            <div className="clinic-card p-5">
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Medical File
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Chief Complaint', value: patient.medicalFile.chiefComplaint },
                  { label: 'Medical History', value: patient.medicalFile.medicalHistory },
                  { label: 'Family History', value: patient.medicalFile.familyHistory },
                  { label: 'Current Medications', value: patient.medicalFile.currentMeds },
                ].map(item => item.value && (
                  <div key={item.label}>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-sm text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="clinic-card p-5">
            <h3 className="font-semibold text-sm text-foreground mb-4">Recent Prescriptions</h3>
            {patient.prescriptions.slice(0, 3).length === 0 ? (
              <p className="text-sm text-muted-foreground">No prescriptions yet</p>
            ) : (
              <div className="space-y-2">
                {patient.prescriptions.slice(0, 3).map((rx: any) => (
                  <Link key={rx.id} href={`/prescriptions/${rx.id}`} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rx.diagnosis || 'Prescription'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(rx.date)} · {rx.items.length} medications</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="clinic-card divide-y divide-border overflow-hidden">
          {patient.prescriptions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No prescriptions</p>
            </div>
          ) : (
            patient.prescriptions.map((rx: any) => (
              <Link key={rx.id} href={`/prescriptions/${rx.id}`} className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                <div>
                  <p className="font-medium text-sm text-foreground">{rx.diagnosis || 'Prescription'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(rx.date)} · Dr. {rx.doctor.name} · {rx.items.length} items
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="clinic-card divide-y divide-border overflow-hidden">
          {patient.payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No payment records</p>
            </div>
          ) : (
            patient.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm text-foreground">{p.description || 'Consultation fee'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(p.date)} · {p.method} · By {p.recordedBy.name}
                  </p>
                </div>
                <span className="font-semibold text-emerald-600">{fmt(p.amount)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="clinic-card divide-y divide-border overflow-hidden">
          {patient.documents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No documents</p>
            </div>
          ) : (
            patient.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(doc.date)} · {doc.type} · Dr. {doc.doctor.name}
                  </p>
                </div>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{doc.type}</span>
              </div>
            ))
          )}
        </div>
      )}

      {showPayment && (
        <RecordPaymentDialog
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          onClose={() => setShowPayment(false)}
          onRecord={() => { setShowPayment(false); router.refresh() }}
        />
      )}
    </div>
  )
}
