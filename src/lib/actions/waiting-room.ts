// src/lib/actions/waiting-room.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getWaitingList() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.waitingRoom.findMany({
    where: {
      status: { in: ['WAITING', 'IN_CONSULTATION'] },
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: [{ priority: 'desc' }, { registeredAt: 'asc' }],
  })
}

export async function callPatient(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') throw new Error('Unauthorized')

  const entry = await prisma.waitingRoom.update({
    where: { id },
    data: { status: 'IN_CONSULTATION', calledAt: new Date() },
  })

  revalidatePath('/waiting-room')
  return { success: true, entry }
}

export async function removeFromWaiting(id: string, status: 'DONE' | 'LEFT' = 'DONE') {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const entry = await prisma.waitingRoom.update({
    where: { id },
    data: { status, doneAt: new Date() },
  })

  revalidatePath('/waiting-room')
  return { success: true, entry }
}

export async function getTodayStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [waiting, inConsult, done] = await Promise.all([
    prisma.waitingRoom.count({ where: { status: 'WAITING', date: { gte: today } } }),
    prisma.waitingRoom.count({ where: { status: 'IN_CONSULTATION', date: { gte: today } } }),
    prisma.waitingRoom.count({ where: { status: 'DONE', date: { gte: today } } }),
  ])

  return { waiting, inConsult, done, total: waiting + inConsult + done }
}
