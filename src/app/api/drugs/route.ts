// src/app/api/drugs/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (q.length < 2) return NextResponse.json([])

  const drugs = await prisma.drug.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
      ],
      isActive: true,
    },
    take: 8,
    select: { id: true, name: true, genericName: true, category: true, commonDosages: true, dosageForms: true },
  })

  return NextResponse.json(drugs)
}
