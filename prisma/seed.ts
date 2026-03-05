// prisma/seed.ts
import { PrismaClient, Role, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinic.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Mitchell',
      email: 'doctor@clinic.com',
      password: hashedPassword,
      role: Role.DOCTOR,
    },
  })

  const secretary = await prisma.user.upsert({
    where: { email: 'secretary@clinic.com' },
    update: {},
    create: {
      name: 'Emma Johnson',
      email: 'secretary@clinic.com',
      password: hashedPassword,
      role: Role.SECRETARY,
    },
  })

  // Clinic settings
  await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      clinicName: 'MediCare Clinic',
      doctorName: 'Dr. Sarah Mitchell',
      doctorSpecialty: 'General Medicine',
      address: '123 Health Street, Medical District',
      phone: '+1 (555) 123-4567',
      email: 'contact@medicare-clinic.com',
      consultationPrice: 75,
      currency: 'USD',
      prescriptionHeader: 'MediCare Clinic — Dr. Sarah Mitchell, MD',
      prescriptionFooter: 'This prescription is valid for 30 days from the date of issue.',
    },
  })

  // Patients
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { nationalId: 'NID001' },
      update: {},
      create: {
        firstName: 'James',
        lastName: 'Wilson',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'MALE',
        phone: '+1 555-0101',
        email: 'james.wilson@email.com',
        nationalId: 'NID001',
        bloodType: 'A+',
        allergies: ['Penicillin'],
        hasFile: true,
        medicalFile: {
          create: {
            chiefComplaint: 'Hypertension management',
            medicalHistory: 'Diagnosed with hypertension in 2018. On medication.',
            familyHistory: 'Father had heart disease.',
            currentMeds: 'Lisinopril 10mg daily',
          }
        }
      }
    }),
    prisma.patient.upsert({
      where: { nationalId: 'NID002' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Garcia',
        dateOfBirth: new Date('1992-07-22'),
        gender: 'FEMALE',
        phone: '+1 555-0102',
        email: 'maria.garcia@email.com',
        nationalId: 'NID002',
        bloodType: 'O+',
        allergies: [],
        hasFile: true,
        medicalFile: {
          create: {
            chiefComplaint: 'Routine checkup',
            medicalHistory: 'No significant medical history.',
            currentMeds: 'None',
          }
        }
      }
    }),
    prisma.patient.upsert({
      where: { nationalId: 'NID003' },
      update: {},
      create: {
        firstName: 'Robert',
        lastName: 'Chen',
        dateOfBirth: new Date('1978-11-05'),
        gender: 'MALE',
        phone: '+1 555-0103',
        nationalId: 'NID003',
        hasFile: false,
      }
    }),
    prisma.patient.upsert({
      where: { nationalId: 'NID004' },
      update: {},
      create: {
        firstName: 'Aisha',
        lastName: 'Patel',
        dateOfBirth: new Date('2001-04-18'),
        gender: 'FEMALE',
        phone: '+1 555-0104',
        nationalId: 'NID004',
        bloodType: 'B+',
        hasFile: true,
        medicalFile: {
          create: {
            chiefComplaint: 'Asthma follow-up',
            medicalHistory: 'Childhood-onset asthma.',
            currentMeds: 'Salbutamol inhaler PRN',
          }
        }
      }
    }),
  ])

  // Drug database
  const drugs = [
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForms: ['500mg capsule', '250mg/5ml suspension'], commonDosages: ['500mg 3x/day', '875mg 2x/day'] },
    { name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'NSAID', dosageForms: ['200mg tablet', '400mg tablet', '600mg tablet'], commonDosages: ['400mg 3x/day', '600mg 3x/day'] },
    { name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Analgesic', dosageForms: ['500mg tablet', '1g tablet', '125mg suppository'], commonDosages: ['500mg 4x/day', '1g 3x/day'] },
    { name: 'Lisinopril', genericName: 'Lisinopril', category: 'ACE Inhibitor', dosageForms: ['5mg tablet', '10mg tablet', '20mg tablet'], commonDosages: ['10mg once daily', '20mg once daily'] },
    { name: 'Metformin', genericName: 'Metformin HCl', category: 'Antidiabetic', dosageForms: ['500mg tablet', '1000mg tablet'], commonDosages: ['500mg 2x/day', '1000mg 2x/day'] },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', category: 'Statin', dosageForms: ['10mg tablet', '20mg tablet', '40mg tablet'], commonDosages: ['20mg once daily', '40mg once daily'] },
    { name: 'Omeprazole', genericName: 'Omeprazole', category: 'PPI', dosageForms: ['20mg capsule', '40mg capsule'], commonDosages: ['20mg once daily', '40mg once daily'] },
    { name: 'Azithromycin', genericName: 'Azithromycin', category: 'Antibiotic', dosageForms: ['250mg tablet', '500mg tablet'], commonDosages: ['500mg on day 1, then 250mg for 4 days'] },
    { name: 'Salbutamol', genericName: 'Albuterol', category: 'Bronchodilator', dosageForms: ['100mcg inhaler', '2mg tablet'], commonDosages: ['2 puffs PRN', '4mg 3x/day'] },
    { name: 'Cetirizine', genericName: 'Cetirizine HCl', category: 'Antihistamine', dosageForms: ['10mg tablet', '5mg/5ml syrup'], commonDosages: ['10mg once daily'] },
    { name: 'Prednisone', genericName: 'Prednisone', category: 'Corticosteroid', dosageForms: ['5mg tablet', '10mg tablet', '20mg tablet'], commonDosages: ['20mg once daily', '40mg once daily tapering'] },
    { name: 'Losartan', genericName: 'Losartan Potassium', category: 'ARB', dosageForms: ['25mg tablet', '50mg tablet', '100mg tablet'], commonDosages: ['50mg once daily', '100mg once daily'] },
    { name: 'Metronidazole', genericName: 'Metronidazole', category: 'Antibiotic', dosageForms: ['400mg tablet', '500mg tablet'], commonDosages: ['400mg 3x/day for 7 days'] },
    { name: 'Sertraline', genericName: 'Sertraline HCl', category: 'SSRI', dosageForms: ['50mg tablet', '100mg tablet'], commonDosages: ['50mg once daily', '100mg once daily'] },
    { name: 'Diclofenac', genericName: 'Diclofenac Sodium', category: 'NSAID', dosageForms: ['50mg tablet', '75mg tablet', '1% gel'], commonDosages: ['50mg 3x/day', '75mg 2x/day'] },
  ]

  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { id: drug.name.toLowerCase().replace(/\s/g, '-') },
      update: {},
      create: { id: drug.name.toLowerCase().replace(/\s/g, '-'), ...drug },
    })
  }

  // Prescription templates
  await prisma.prescriptionTemplate.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Common Cold',
        description: 'Standard treatment for upper respiratory infection',
        items: [
          { drugName: 'Paracetamol', dosage: '500mg', frequency: '3x/day', duration: '5 days', instructions: 'Take after meals' },
          { drugName: 'Cetirizine', dosage: '10mg', frequency: 'Once at night', duration: '5 days', instructions: '' },
          { drugName: 'Omeprazole', dosage: '20mg', frequency: 'Once before breakfast', duration: '5 days', instructions: '' },
        ]
      },
      {
        name: 'Hypertension (Standard)',
        description: 'Standard hypertension management',
        items: [
          { drugName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Monitor blood pressure' },
          { drugName: 'Atorvastatin', dosage: '20mg', frequency: 'Once at night', duration: '30 days', instructions: 'Take with water' },
        ]
      },
      {
        name: 'Bacterial Infection',
        description: 'Broad-spectrum antibiotic course',
        items: [
          { drugName: 'Amoxicillin', dosage: '500mg', frequency: '3x/day', duration: '7 days', instructions: 'Complete full course' },
          { drugName: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '7 days', instructions: 'Take before meals' },
        ]
      }
    ]
  })

  // Sample payments for financial data
  const paymentData = []
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 60)
    paymentData.push({
      patientId: patients[Math.floor(Math.random() * patients.length)].id,
      recordedById: secretary.id,
      amount: [50, 75, 100, 75, 50, 125][Math.floor(Math.random() * 6)],
      method: [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.CASH][Math.floor(Math.random() * 3)],
      description: 'Consultation fee',
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    })
  }

  await prisma.payment.createMany({ data: paymentData, skipDuplicates: false })

  // Sample expenses
  await prisma.expense.createMany({
    skipDuplicates: false,
    data: [
      { category: 'Supplies', description: 'Medical gloves & masks', amount: 85, date: new Date(Date.now() - 5 * 86400000) },
      { category: 'Utilities', description: 'Electricity bill', amount: 220, date: new Date(Date.now() - 10 * 86400000) },
      { category: 'Equipment', description: 'Stethoscope replacement', amount: 150, date: new Date(Date.now() - 15 * 86400000) },
      { category: 'Supplies', description: 'Printer ink cartridges', amount: 45, date: new Date(Date.now() - 20 * 86400000) },
      { category: 'Rent', description: 'Monthly clinic rent', amount: 2500, date: new Date(Date.now() - 25 * 86400000) },
    ]
  })

  console.log('✅ Seed complete!')
  console.log('📧 Doctor: doctor@clinic.com / password123')
  console.log('📧 Secretary: secretary@clinic.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
