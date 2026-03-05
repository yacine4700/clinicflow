// src/app/(dashboard)/finance/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getFinancialStats, getMonthlyChartData, getRecentPayments } from '@/lib/actions/finance'
import { FinanceDashboard } from '@/components/finance/finance-dashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Finance' }
export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const session = await auth()
  if (session?.user?.role !== 'DOCTOR') redirect('/dashboard')

  const [stats, chartData, recentPayments] = await Promise.all([
    getFinancialStats(),
    getMonthlyChartData(),
    getRecentPayments(15),
  ])

  return (
    <FinanceDashboard
      stats={stats}
      chartData={chartData}
      recentPayments={recentPayments as any}
    />
  )
}
