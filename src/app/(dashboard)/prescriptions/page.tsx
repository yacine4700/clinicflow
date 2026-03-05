// src/app/(dashboard)/prescriptions/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { FilePlus, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Prescriptions' }
export const dynamic = 'force-dynamic'

export default async function PrescriptionsPage() {
  const session = await auth()

  const prescriptions = await prisma.prescription.findMany({
    where: session?.user?.role === 'DOCTOR' ? { doctorId: session.user.id } : undefined,
    include: {
      patient: { select: { firstName: true, lastName: true } },
      doctor: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { date: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{prescriptions.length} recent prescriptions</p>
        </div>
        {session?.user?.role === 'DOCTOR' && (
          <Link
            href="/prescriptions/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <FilePlus className="w-4 h-4" />
            New Prescription
          </Link>
        )}
      </div>

      <div className="clinic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Diagnosis</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Doctor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Meds</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prescriptions.map(rx => (
                <tr key={rx.id} className="hover:bg-accent/40 transition-colors cursor-pointer group">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{rx.patient.firstName} {rx.patient.lastName}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-muted-foreground">{rx.diagnosis || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-muted-foreground">{rx.doctor.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{formatDate(rx.date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 px-2 py-0.5 rounded-full">
                      {rx._count.items} drugs
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/prescriptions/${rx.id}`} className="text-primary hover:underline text-xs flex items-center gap-1">
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {prescriptions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FilePlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No prescriptions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
