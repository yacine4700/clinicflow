// src/lib/actions/patients.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  hasFile: z.boolean().optional(),
  // Medical file fields
  chiefComplaint: z.string().optional(),
  medicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  currentMeds: z.string().optional(),
})

export async function createPatient(formData: z.infer<typeof patientSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const data = patientSchema.parse(formData)

  const patient = await prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      nationalId: data.nationalId || null,
      bloodType: data.bloodType,
      allergies: data.allergies || [],
      notes: data.notes,
      hasFile: data.hasFile || false,
      ...(data.hasFile && (data.chiefComplaint || data.medicalHistory) ? {
        medicalFile: {
          create: {
            chiefComplaint: data.chiefComplaint,
            medicalHistory: data.medicalHistory,
            familyHistory: data.familyHistory,
            currentMeds: data.currentMeds,
          }
        }
      } : {}),
    },
  })

  revalidatePath('/patients')
  return { success: true, patient }
}

export async function updatePatient(id: string, formData: Partial<z.infer<typeof patientSchema>>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...formData,
      email: formData.email || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    },
  })

  revalidatePath(`/patients/${id}`)
  revalidatePath('/patients')
  return { success: true, patient }
}

export async function getPatients(search?: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.patient.findMany({
    where: search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { nationalId: { contains: search } },
      ],
    } : undefined,
    include: { medicalFile: true, _count: { select: { prescriptions: true, payments: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPatientById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return prisma.patient.findUnique({
    where: { id },
    include: {
      medicalFile: true,
      prescriptions: {
        include: { items: true, doctor: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 10,
      },
      payments: {
        include: { recordedBy: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 10,
      },
      documents: {
        include: { doctor: { select: { name: true } } },
        orderBy: { date: 'desc' },
      },
    },
  })
}

export async function addToWaitingRoom(patientId: string, notes?: string, priority = 0) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // Check not already waiting
  const existing = await prisma.waitingRoom.findFirst({
    where: { patientId, status: 'WAITING' },
  })
  if (existing) return { success: false, error: 'Patient already in waiting room' }

  const entry = await prisma.waitingRoom.create({
    data: {
      patientId,
      notes,
      priority,
      date: new Date(),
    },
    include: { patient: { select: { firstName: true, lastName: true, phone: true } } },
  })

  revalidatePath('/waiting-room')
  return { success: true, entry }
}
