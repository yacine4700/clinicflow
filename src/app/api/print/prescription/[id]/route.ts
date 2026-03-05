// src/app/api/print/prescription/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const [prescription, settings] = await Promise.all([
    prisma.prescription.findUnique({
      where: { id },
      include: {
        items: { orderBy: { order: 'asc' } },
        patient: true,
        doctor: { select: { name: true } },
      },
    }),
    prisma.clinicSettings.findUnique({ where: { id: 'default' } }),
  ])

  if (!prescription) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const clinicName = settings?.clinicName || 'Medical Clinic'
  const doctorName = settings?.doctorName || prescription.doctor.name
  const specialty = settings?.doctorSpecialty || ''
  const address = settings?.address || ''
  const phone = settings?.phone || ''
  const footer = settings?.prescriptionFooter || 'This prescription is valid for 30 days from the date of issue.'
  const rxDate = format(new Date(prescription.date), 'MMMM d, yyyy')
  const rxId = prescription.id.slice(-8).toUpperCase()
  const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`
  const dob = prescription.patient.dateOfBirth
    ? format(new Date(prescription.patient.dateOfBirth), 'MMMM d, yyyy')
    : ''

  const itemsHtml = prescription.items.map((item, i) => `
    <div class="rx-item">
      <div class="rx-num">${i + 1}</div>
      <div class="rx-content">
        <div class="drug-header">
          <span class="drug-name">${item.drugName}</span>
          <span class="drug-dosage">${item.dosage}</span>
        </div>
        <div class="drug-details">
          <span><strong>Frequency:</strong> ${item.frequency}</span>
          <span><strong>Duration:</strong> ${item.duration}</span>
        </div>
        ${item.instructions ? `<div class="drug-instructions">↳ ${item.instructions}</div>` : ''}
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Prescription - ${patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #f8fafc; color: #0f172a; font-size: 13px; line-height: 1.5; }
    .page { max-width: 794px; margin: 0 auto; background: white; min-height: 1123px; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0891b2 100%); padding: 28px 36px; color: white; display: flex; justify-content: space-between; align-items: flex-start; }
    .clinic-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; }
    .doctor-title { font-size: 13px; opacity: 0.85; margin-top: 3px; }
    .doctor-specialty { font-size: 11px; opacity: 0.7; margin-top: 2px; font-style: italic; }
    .header-right { text-align: right; font-size: 11px; opacity: 0.8; line-height: 1.7; }
    .rx-id { font-size: 10px; opacity: 0.6; margin-top: 6px; font-family: monospace; letter-spacing: 1px; }
    .meta-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 20px 36px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .meta-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 3px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .meta-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
    .body { padding: 28px 36px; flex: 1; }
    .rx-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .rx-symbol { font-family: 'Playfair Display', serif; font-size: 52px; color: #0284c7; line-height: 1; font-weight: 600; }
    .rx-divider { flex: 1; height: 1px; background: #e2e8f0; }
    .rx-item { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid #f1f5f9; }
    .rx-item:last-child { border-bottom: none; }
    .rx-num { width: 26px; height: 26px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
    .rx-content { flex: 1; }
    .drug-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .drug-name { font-size: 16px; font-weight: 700; color: #0f172a; }
    .drug-dosage { font-size: 13px; font-weight: 600; color: #0284c7; flex-shrink: 0; }
    .drug-details { display: flex; gap: 20px; margin-top: 4px; font-size: 12px; color: #64748b; }
    .drug-details strong { color: #334155; }
    .drug-instructions { font-size: 12px; color: #64748b; font-style: italic; margin-top: 4px; }
    .diagnosis-section { margin-bottom: 24px; padding: 12px 16px; background: #f0f9ff; border-left: 3px solid #0284c7; border-radius: 0 8px 8px 0; }
    .diagnosis-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0369a1; margin-bottom: 3px; }
    .diagnosis-text { font-size: 13px; font-weight: 500; color: #0f172a; }
    .notes-box { margin-top: 20px; padding: 14px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; }
    .notes-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; margin-bottom: 4px; }
    .notes-text { font-size: 12px; color: #0f172a; }
    .signature-area { padding: 20px 36px; display: flex; justify-content: flex-end; }
    .signature-block { text-align: right; }
    .signature-line { width: 180px; height: 60px; border-bottom: 2px solid #0f172a; margin-bottom: 8px; }
    .signature-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .signature-title { font-size: 11px; color: #64748b; margin-top: 2px; }
    .footer { background: #f8fafc; padding: 14px 36px; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer-text { font-size: 10px; color: #94a3b8; letter-spacing: 0.01em; }
    @media print { body { background: white; } .page { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="clinic-name">${clinicName}</div>
        <div class="doctor-title">${doctorName}</div>
        ${specialty ? `<div class="doctor-specialty">${specialty}</div>` : ''}
      </div>
      <div class="header-right">
        ${address ? `<div>${address}</div>` : ''}
        ${phone ? `<div>${phone}</div>` : ''}
        <div class="rx-id">RX-${rxId}</div>
      </div>
    </div>
    <div class="meta-bar">
      <div>
        <div class="meta-label">Patient</div>
        <div class="meta-value">${patientName}</div>
        ${dob ? `<div class="meta-sub">DOB: ${dob}</div>` : ''}
        ${prescription.patient.phone ? `<div class="meta-sub">${prescription.patient.phone}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div class="meta-label">Date of Issue</div>
        <div class="meta-value">${rxDate}</div>
      </div>
    </div>
    <div class="body">
      ${prescription.diagnosis ? `<div class="diagnosis-section"><div class="diagnosis-label">Diagnosis</div><div class="diagnosis-text">${prescription.diagnosis}</div></div>` : ''}
      <div class="rx-header">
        <div class="rx-symbol">&#8478;</div>
        <div class="rx-divider"></div>
      </div>
      <div>${itemsHtml}</div>
      ${prescription.notes ? `<div class="notes-box"><div class="notes-label">Doctor's Notes</div><div class="notes-text">${prescription.notes}</div></div>` : ''}
    </div>
    <div class="signature-area">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${doctorName}</div>
        ${specialty ? `<div class="signature-title">${specialty}</div>` : ''}
      </div>
    </div>
    <div class="footer"><div class="footer-text">${footer}</div></div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
