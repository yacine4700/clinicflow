'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, UserPlus, Users, FileText, ChevronRight } from 'lucide-react'
import { formatDate, calculateAge } from '@/lib/utils'
import { AddPatientDialog } from './add-patient-dialog'
import { useT } from '@/components/providers/app-provider'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  gender: string | null
  phone: string | null
  bloodType: string | null
  hasFile: boolean
  createdAt: Date
  _count: { prescriptions: number; payments: number }
}

export function PatientsClient({ patients, searchQuery }: { patients: Patient[]; searchQuery: string }) {
  const router = useRouter()
  const t = useT()
  const [search, setSearch] = useState(searchQuery)
  const [showAdd, setShowAdd] = useState(false)

  const handleSearch = (q: string) => {
    setSearch(q)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    router.push(`/patients?${params.toString()}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('patients.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{patients.length} {t('patients.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          {t('patients.addPatient')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={t('patients.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div className="clinic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('common.patient')}</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">{t('patients.ageGender')}</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">{t('common.phone')}</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">{t('patients.records')}</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('patients.file')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="w-10 h-10 opacity-30" />
                      <p className="font-medium">{t('patients.noPatients')}</p>
                      {search && <p className="text-xs">{t('patients.noPatientsHint')}</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr
                    key={patient.id}
                    className="hover:bg-accent/40 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{patient.firstName} {patient.lastName}</p>
                          <p className="text-xs text-muted-foreground">{t('common.addedOn')} {formatDate(patient.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-foreground">
                        {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} ${t('patients.years')}` : '—'}
                        {patient.gender && ` · ${patient.gender.charAt(0)}`}
                      </p>
                      {patient.bloodType && <p className="text-xs text-muted-foreground">{patient.bloodType}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-foreground">{patient.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{patient._count.prescriptions} Rx</span>
                        <span>{patient._count.payments} {t('patients.paymentsCount').toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {patient.hasFile ? (
                        <span className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 px-2 py-0.5 rounded-full w-fit">
                          <FileText className="w-3 h-3" />
                          {t('patients.onFile')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('patients.walkin')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddPatientDialog
          onClose={() => setShowAdd(false)}
          onAdd={() => { setShowAdd(false); router.refresh() }}
        />
      )}
    </div>
  )
}
