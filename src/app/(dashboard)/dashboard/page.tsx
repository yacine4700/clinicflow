// src/app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getTodayStats } from '@/lib/actions/waiting-room'
import { getFinancialStats } from '@/lib/actions/finance'
import { formatCurrency } from '@/lib/utils'
import { Users, Clock, DollarSign, Activity, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function getQuickStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalPatients, todayNew] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { createdAt: { gte: today } } }),
  ])

  return { totalPatients, todayNew }
}

export default async function DashboardPage() {
  const session = await auth()
  const isDoctor = session?.user?.role === 'DOCTOR'

  const [waitingStats, patientStats] = await Promise.all([
    getTodayStats(),
    getQuickStats(),
  ])

  const financialStats = isDoctor ? await getFinancialStats() : null

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Waiting Now"
          value={waitingStats.waiting}
          sub={`${waitingStats.inConsult} in consultation`}
          icon={Clock}
          color="sky"
        />
        <StatCard
          title="Seen Today"
          value={waitingStats.done}
          sub={`${waitingStats.total} total today`}
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Total Patients"
          value={patientStats.totalPatients}
          sub={`${patientStats.todayNew} new today`}
          icon={Users}
          color="violet"
        />
        {isDoctor && financialStats ? (
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(financialStats.todayRevenue)}
            sub={`${financialStats.todayCount} consultations`}
            icon={DollarSign}
            color="amber"
          />
        ) : (
          <StatCard
            title="Today's Visits"
            value={waitingStats.total}
            sub="All statuses"
            icon={TrendingUp}
            color="amber"
          />
        )}
      </div>

      {/* Doctor-only financial summary */}
      {isDoctor && financialStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="clinic-card p-5 col-span-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Monthly Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialStats.monthRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(financialStats.monthExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Expenses</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${financialStats.netIncome >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {formatCurrency(financialStats.netIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Net Income</p>
              </div>
            </div>
          </div>
          <div className="clinic-card p-5">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'New Prescription', href: '/prescriptions/new' },
                { label: 'View Finance', href: '/finance' },
                { label: 'Patient Records', href: '/patients' },
              ].map(link => (
                <a key={link.href} href={link.href} className="block text-sm text-primary hover:underline">
                  → {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}

function StatCard({
  title, value, sub, icon: Icon, color,
}: {
  title: string
  value: string | number
  sub: string
  icon: React.ElementType
  color: 'sky' | 'emerald' | 'violet' | 'amber'
}) {
  const colors = {
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

async function RecentActivity() {
  const recent = await prisma.waitingRoom.findMany({
    where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    take: 5,
    orderBy: { registeredAt: 'desc' },
    include: { patient: { select: { firstName: true, lastName: true } } },
  })

  return (
    <div className="clinic-card p-5">
      <h3 className="font-semibold text-sm text-foreground mb-4">Today's Activity</h3>
      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No activity recorded today</p>
      ) : (
        <div className="space-y-2">
          {recent.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  entry.status === 'WAITING' ? 'bg-amber-400' :
                  entry.status === 'IN_CONSULTATION' ? 'bg-sky-400' :
                  entry.status === 'DONE' ? 'bg-emerald-400' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.patient.firstName} {entry.patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{entry.status.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.registeredAt), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
