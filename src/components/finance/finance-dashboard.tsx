// src/components/finance/finance-dashboard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, Activity, Plus, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { addExpense } from '@/lib/actions/finance'
import { toast } from 'sonner'
import { RecordPaymentDialog } from './record-payment-dialog'

interface Stats {
  todayRevenue: number; todayCount: number
  monthRevenue: number; monthExpenses: number; netIncome: number; pendingPayments: number
}

export function FinanceDashboard({
  stats, chartData, recentPayments,
}: {
  stats: Stats
  chartData: { month: string; revenue: number; expenses: number }[]
  recentPayments: any[]
}) {
  const router = useRouter()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: '' })
  const [saving, setSaving] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      toast.error('Fill all expense fields'); return
    }
    setSaving(true)
    try {
      await addExpense({
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
      })
      toast.success('Expense recorded')
      setExpenseForm({ category: '', description: '', amount: '' })
      setShowExpenseForm(false)
      router.refresh()
    } catch {
      toast.error('Failed to save expense')
    }
    setSaving(false)
  }

  const statCards = [
    { title: "Today's Revenue", value: formatCurrency(stats.todayRevenue), sub: `${stats.todayCount} consultations`, icon: DollarSign, color: 'emerald' as const },
    { title: 'Monthly Revenue', value: formatCurrency(stats.monthRevenue), sub: 'This month', icon: TrendingUp, color: 'sky' as const },
    { title: 'Monthly Expenses', value: formatCurrency(stats.monthExpenses), sub: 'This month', icon: TrendingDown, color: 'rose' as const },
    { title: 'Net Income', value: formatCurrency(stats.netIncome), sub: 'Revenue - Expenses', icon: Activity, color: stats.netIncome >= 0 ? 'emerald' as const : 'rose' as const },
  ]

  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Revenue, expenses, and financial overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <button
            onClick={() => setShowPayment(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.title} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.title}</p>
                <p className={cn('text-2xl font-bold mt-1', card.color === 'rose' ? 'text-rose-600' : card.color === 'emerald' ? 'text-emerald-600' : 'text-foreground')}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[card.color]}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Form */}
      {showExpenseForm && (
        <div className="clinic-card p-5">
          <h3 className="font-semibold text-sm text-foreground mb-4">Record New Expense</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                value={expenseForm.category}
                onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                className="input-field mt-1"
              >
                <option value="">Select...</option>
                {['Supplies', 'Equipment', 'Utilities', 'Rent', 'Staff', 'Marketing', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <input
                value={expenseForm.description}
                onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                className="input-field mt-1"
                placeholder="e.g., Medical gloves"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                className="input-field mt-1"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowExpenseForm(false)} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-accent transition-colors">Cancel</button>
            <button
              onClick={handleAddExpense}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="clinic-card p-5">
        <h3 className="font-semibold text-sm text-foreground mb-5">6-Month Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="clinic-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Recent Payments</h3>
        </div>
        <div className="divide-y divide-border">
          {recentPayments.map((payment: any) => (
            <div key={payment.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.patient.firstName} {payment.patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.description} · {payment.method} · {formatDate(payment.date)}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {showPayment && (
        <RecordPaymentDialog
          onClose={() => setShowPayment(false)}
          onRecord={() => { setShowPayment(false); router.refresh() }}
        />
      )}
    </div>
  )
}
