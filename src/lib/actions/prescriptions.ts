// src/lib/actions/prescriptions.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const prescriptionItemSchema = z.object({
  drugName: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
  order: z.number().optional(),
})

const prescriptionSchema = z.object({
  patientId: z.string(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'Add at least one medication'),
})

export async function createPrescription(data: z.infer<typeof prescriptionSchema>) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') throw new Error('Unauthorized')

  const validated = prescriptionSchema.parse(data)

  const prescription = await prisma.prescription.create({
    data: {
      patientId: validated.patientId,
      doctorId: session.user.id,
      diagnosis: validated.diagnosis,
      notes: validated.notes,
      items: {
        create: validated.items.map((item, index) => ({
          ...item,
          order: item.order ?? index,
        })),
      },
    },
    include: {
      items: true,
      patient: { select: { firstName: true, lastName: true } },
      doctor: { select: { name: true } },
    },
  })

  revalidatePath(`/patients/${validated.patientId}`)
  revalidatePath('/prescriptions')
  return { success: true, prescription }
}

export async function getPrescription(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.prescription.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: 'asc' } },
      patient: true,
      doctor: { select: { name: true } },
    },
  })
}

export async function getTemplates() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.prescriptionTemplate.findMany({ orderBy: { name: 'asc' } })
}

export async function saveTemplate(name: string, description: string, items: any[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'DOCTOR') throw new Error('Unauthorized')

  const template = await prisma.prescriptionTemplate.create({
    data: { name, description, items },
  })

  revalidatePath('/settings')
  return { success: true, template }
}

export async function searchDrugs(query: string) {
  if (!query || query.length < 2) return []

  return prisma.drug.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
    },
    take: 8,
    select: { id: true, name: true, genericName: true, category: true, commonDosages: true, dosageForms: true },
  })
}
