// src/types/index.ts
import { Role, WaitingStatus, PaymentMethod, PaymentStatus, DocumentType } from '@prisma/client'

export type { Role, WaitingStatus, PaymentMethod, PaymentStatus, DocumentType }

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface PatientWithFile {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  gender: string | null
  phone: string | null
  email: string | null
  bloodType: string | null
  allergies: string[]
  hasFile: boolean
  notes: string | null
  medicalFile?: {
    chiefComplaint: string | null
    medicalHistory: string | null
    familyHistory: string | null
    currentMeds: string | null
  } | null
  createdAt: Date
}

export interface WaitingEntry {
  id: string
  patientId: string
  registeredAt: Date
  calledAt: Date | null
  status: WaitingStatus
  priority: number
  notes: string | null
  patient: {
    firstName: string
    lastName: string
    phone: string | null
  }
}

export interface PrescriptionWithItems {
  id: string
  date: Date
  diagnosis: string | null
  notes: string | null
  doctor: { name: string }
  patient: { firstName: string; lastName: string }
  items: {
    id: string
    drugName: string
    dosage: string
    frequency: string
    duration: string
    instructions: string | null
    order: number
  }[]
}

export interface FinancialStats {
  todayRevenue: number
  monthRevenue: number
  monthExpenses: number
  netIncome: number
  totalPatients: number
  pendingPayments: number
}

export interface DrugSuggestion {
  id: string
  name: string
  genericName: string | null
  category: string | null
  commonDosages: string[]
  dosageForms: string[]
}
