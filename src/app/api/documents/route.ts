// src/app/api/documents/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { patientId, type, title, startDate, endDate, reason, content, recipient } = body

  if (!patientId || !title || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const document = await prisma.document.create({
    data: {
      patientId,
      doctorId: session.user.id,
      type,
      title,
      content: { startDate, endDate, reason, content, recipient },
    },
  })

  return NextResponse.json({ success: true, document })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')

  const documents = await prisma.document.findMany({
    where: patientId ? { patientId } : {},
    include: {
      patient: { select: { firstName: true, lastName: true } },
      doctor: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(documents)
}
