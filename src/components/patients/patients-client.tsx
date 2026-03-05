// src/components/patients/patients-client.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, UserPlus, Users, FileText, ChevronRight } from 'lucide-react'
import { formatDate, calculateAge, cn } from '@/lib/utils'
import { AddPatientDialog } from './add-patient-dialog'

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
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{patients.length} patients registered</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          New Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, phone, or ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="clinic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Age / Gender</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Records</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">File</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="w-10 h-10 opacity-30" />
                      <p className="font-medium">No patients found</p>
                      {search && <p className="text-xs">Try a different search term</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-accent/40 transition-colors cursor-pointer group" onClick={() => router.push(`/patients/${patient.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{patient.firstName} {patient.lastName}</p>
                          <p className="text-xs text-muted-foreground">Added {formatDate(patient.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-foreground">
                        {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} yrs` : '—'}
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
                        <span>{patient._count.payments} payments</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {patient.hasFile ? (
                        <span className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 px-2 py-0.5 rounded-full w-fit">
                          <FileText className="w-3 h-3" />
                          On file
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Walk-in</span>
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

      {showAdd && <AddPatientDialog onClose={() => setShowAdd(false)} onAdd={() => { setShowAdd(false); router.refresh() }} />}
    </div>
  )
}
