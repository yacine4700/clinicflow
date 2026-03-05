// src/lib/actions/finance.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

const paymentSchema = z.object({
  patientId: z.string(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'CARD', 'INSURANCE', 'OTHER']).default('CASH'),
  description: z.string().optional(),
})

export async function recordPayment(data: z.infer<typeof paymentSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const payment = await prisma.payment.create({
    data: {
      patientId: data.patientId,
      recordedById: session.user.id,
      amount: data.amount,
      method: data.method,
      description: data.description || 'Consultation fee',
    },
  })

  revalidatePath('/finance')
  revalidatePath(`/patients/${data.patientId}`)
  return { success: true, payment }
}

export async function getFinancialStats() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [todayPayments, monthPayments, monthExpenses, pendingCount] = await Promise.all([
    prisma.payment.aggregate({
      where: { date: { gte: todayStart, lte: todayEnd }, status: 'PAID' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { date: { gte: monthStart, lte: monthEnd }, status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
  ])

  const monthRevenue = monthPayments._sum.amount || 0
  const monthExp = monthExpenses._sum.amount || 0

  return {
    todayRevenue: todayPayments._sum.amount || 0,
    todayCount: todayPayments._count,
    monthRevenue,
    monthExpenses: monthExp,
    netIncome: monthRevenue - monthExp,
    pendingPayments: pendingCount,
  }
}

export async function getMonthlyChartData() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const [revenue, expenses] = await Promise.all([
      prisma.payment.aggregate({
        where: { date: { gte: start, lte: end }, status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ])

    months.push({
      month: format(date, 'MMM'),
      revenue: revenue._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
    })
  }

  return months
}

export async function getRecentPayments(limit = 20) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.payment.findMany({
    take: limit,
    orderBy: { date: 'desc' },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      recordedBy: { select: { name: true } },
    },
  })
}

export async function addExpense(data: { category: string; description: string; amount: number; date?: string }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') throw new Error('Unauthorized')

  const expense = await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
    },
  })

  revalidatePath('/finance')
  return { success: true, expense }
}

export async function getClinicSettings() {
  return prisma.clinicSettings.findUnique({ where: { id: 'default' } })
}

export async function updateClinicSettings(data: any) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') throw new Error('Unauthorized')

  const settings = await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  })

  revalidatePath('/settings')
  return { success: true, settings }
}
