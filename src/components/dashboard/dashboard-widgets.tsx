'use client'

import { useApp, useT } from '@/components/providers/app-provider'
import { DollarSign, TrendingUp } from 'lucide-react'

interface FinancialStats {
  todayRevenue: number
  todayCount: number
  monthRevenue: number
  monthExpenses: number
  netIncome: number
}

export function DashboardFinanceCards({ stats }: { stats: FinancialStats }) {
  const { fmt } = useApp()
  const t = useT()

  return (
    <>
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.dashboard.todayRevenue}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(stats.todayRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stats.todayCount} {t.dashboard.consultations}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>
    </>
  )
}

export function DashboardMonthlySummary({ stats }: { stats: FinancialStats }) {
  const { fmt } = useApp()
  const t = useT()

  return (
    <div className="clinic-card p-5 col-span-2">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">{t.dashboard.monthlySummary}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{fmt(stats.monthRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.revenue}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive">{fmt(stats.monthExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.expenses}</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
            {fmt(stats.netIncome)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.netIncome}</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardGreeting({ name }: { name: string }) {
  const t = useT()
  const h = new Date().getHours()
  const greeting = h < 12 ? t.dashboard.goodMorning : h < 17 ? t.dashboard.goodAfternoon : t.dashboard.goodEvening

  return (
    <span>{greeting}, {name} 👋</span>
  )
}

export function DashboardQuickLinks() {
  const t = useT()
  return (
    <div className="space-y-2">
      {[
        { label: t.dashboard.newPrescription, href: '/prescriptions/new' },
        { label: t.dashboard.viewFinance,     href: '/finance' },
        { label: t.dashboard.patientRecords,  href: '/patients' },
      ].map(link => (
        <a key={link.href} href={link.href} className="block text-sm text-primary hover:underline">
          → {link.label}
        </a>
      ))}
    </div>
  )
}
