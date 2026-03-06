// src/app/api/print/prescription/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'
import type { PrescriptionLayout, CanvasElement } from '@/types/prescription-layout'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [prescription, settings] = await Promise.all([
    prisma.prescription.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } }, patient: true, doctor: { select: { name: true } } },
    }),
    prisma.clinicSettings.findUnique({ where: { id: 'default' } }),
  ])

  if (!prescription) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const layout = settings?.prescriptionLayout as PrescriptionLayout | null | undefined
  const html = layout ? renderLayoutHtml(prescription, settings, layout) : renderDefaultHtml(prescription, settings)

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// ── Render from saved layout ──────────────────────────────────────────────────

function renderLayoutHtml(rx: any, settings: any, layout: PrescriptionLayout): string {
  const cs = settings || {}
  const patient = rx.patient
  const patientName = `${patient.firstName} ${patient.lastName}`
  const patientAge = patient.dateOfBirth
    ? `${Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years`
    : ''
  const rxDate = format(new Date(rx.date), 'MMMM d, yyyy')
  const { canvasSettings, elements } = layout
  const { backgroundColor, width, height } = canvasSettings

  // Build element value map
  const getVal = (type: string): string => {
    switch (type) {
      case 'clinic-name':      return cs.clinicName || ''
      case 'clinic-address':   return cs.address || ''
      case 'clinic-phone':     return cs.phone || ''
      case 'clinic-email':     return cs.email || ''
      case 'doctor-name':      return cs.doctorName ? `Dr. ${cs.doctorName}` : rx.doctor.name
      case 'doctor-specialty': return cs.doctorSpecialty || ''
      case 'patient-name':     return `Patient: ${patientName}`
      case 'patient-age':      return patientAge ? `Age: ${patientAge}` : ''
      case 'date':             return rxDate
      case 'rx-symbol':        return '&#8478;'
      case 'footer-notes':     return cs.prescriptionFooter || 'This prescription is valid for 30 days.'
      default: return ''
    }
  }

  const getDrugListHtml = (el: CanvasElement): string => {
    const cfg = el.drugListConfig
    const mode = cfg?.mode || 'table'
    const items = rx.items

    if (mode === 'table') {
      const cols = [cfg?.showDrugName !== false && '2fr', cfg?.showDosage !== false && '1fr', cfg?.showDuration !== false && '1fr'].filter(Boolean).join(' ')
      const headerBg = cfg?.headerBg || '#f0f9ff'
      let html = `<div style="width:100%;font-size:11px;">`
      html += `<div style="display:grid;grid-template-columns:${cols};background:${headerBg};">`
      if (cfg?.showDrugName !== false) html += `<div style="padding:4px 8px;font-weight:600;color:#0369a1;">Drug Name</div>`
      if (cfg?.showDosage !== false)   html += `<div style="padding:4px 8px;font-weight:600;color:#0369a1;">Dosage</div>`
      if (cfg?.showDuration !== false) html += `<div style="padding:4px 8px;font-weight:600;color:#0369a1;">Duration</div>`
      html += `</div>`
      items.forEach((item: any, i: number) => {
        const bg = cfg?.stripedRows && i % 2 === 1 ? '#f8fafc' : 'transparent'
        html += `<div style="display:grid;grid-template-columns:${cols};background:${bg};margin-bottom:${(cfg?.rowSpacing || 0) / 2}px;">`
        if (cfg?.showDrugName !== false) html += `<div style="padding:3px 8px;">${i + 1}. ${item.drugName}</div>`
        if (cfg?.showDosage !== false)   html += `<div style="padding:3px 8px;color:#0284c7;">${item.dosage}</div>`
        if (cfg?.showDuration !== false) html += `<div style="padding:3px 8px;color:#64748b;">${item.duration}</div>`
        html += `</div>`
        if (cfg?.showInstructions !== false && item.instructions)
          html += `<div style="padding:2px 8px 4px 24px;font-size:10px;color:#64748b;font-style:italic;">${item.instructions}</div>`
      })
      html += `</div>`
      return html
    }

    if (mode === 'list') {
      return items.map((item: any, i: number) => {
        let line = `<div style="font-size:12px;padding-bottom:${cfg?.rowSpacing || 6}px;border-bottom:1px solid #f1f5f9;">`
        line += `<strong>${i + 1}. ${item.drugName}</strong>`
        if (cfg?.showDosage !== false)    line += ` <span style="color:#0284c7;">${item.dosage}</span>`
        if (cfg?.showFrequency !== false) line += ` <span style="color:#64748b;">— ${item.frequency}</span>`
        if (cfg?.showDuration !== false)  line += ` <span style="color:#64748b;"> · ${item.duration}</span>`
        if (cfg?.showInstructions !== false && item.instructions)
          line += `<br/><span style="font-size:10px;color:#94a3b8;font-style:italic;">${item.instructions}</span>`
        line += `</div>`
        return line
      }).join('')
    }

    // compact
    return items.map((item: any, i: number) => {
      let line = `<div style="display:flex;gap:8px;font-size:11px;padding-bottom:2px;">`
      line += `<span style="color:#94a3b8;min-width:16px;">${i + 1}.</span>`
      line += `<span style="font-weight:600;flex:1;">${item.drugName}</span>`
      if (cfg?.showDosage !== false)   line += `<span style="color:#0284c7;">${item.dosage}</span>`
      if (cfg?.showDuration !== false) line += `<span style="color:#64748b;font-size:10px;">— ${item.duration}</span>`
      line += `</div>`
      return line
    }).join('')
  }

  const getSignatureHtml = (el: CanvasElement): string => {
    const st = el.style
    return `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;">
        <div style="flex:1;border-bottom:1.5px solid ${st.color || '#334155'};margin-bottom:4px;"></div>
        <div style="font-size:${Math.max(st.fontSize - 2, 9)}px;color:${st.color || '#0f172a'};">${cs.doctorName ? `Dr. ${cs.doctorName}` : rx.doctor.name}</div>
        <div style="font-size:${Math.max(st.fontSize - 3, 8)}px;color:#94a3b8;">${cs.doctorSpecialty || 'Physician'}</div>
      </div>`
  }

  // Sort by zIndex
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex).filter(e => e.visible)

  const elementsHtml = sorted.map(el => {
    const st = el.style
    const isDiv = el.type === 'divider'
    const isBlock = ['drug-list', 'signature-block', 'clinic-logo'].includes(el.type)
    const fw = st.fontWeight === 'normal' ? 400 : st.fontWeight === 'medium' ? 500 : st.fontWeight === 'semibold' ? 600 : 700
    const bg = isDiv ? (st.backgroundColor || '#e2e8f0') : st.backgroundColor

    let content = ''
    if (el.type === 'drug-list')       content = getDrugListHtml(el)
    else if (el.type === 'signature-block') content = getSignatureHtml(el)
    else if (el.type === 'clinic-logo')     content = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(2,132,199,0.08);border:2px dashed rgba(2,132,199,0.3);border-radius:6px;">&#127973;</div>`
    else if (el.type === 'divider')         content = ''
    else                                     content = getVal(el.type)

    const display = isBlock ? 'block' : 'flex'
    const align = !isBlock ? (st.textAlign === 'center' ? 'center' : st.textAlign === 'right' ? 'flex-end' : 'flex-start') : ''
    const padding = isBlock ? '0' : `${st.padding}px`
    const border = st.borderWidth > 0 ? `${st.borderWidth}px solid ${st.borderColor}` : 'none'

    return `<div style="
      position:absolute;
      left:${el.x}px;top:${el.y}px;
      width:${el.width}px;height:${el.height}px;
      font-size:${st.fontSize}px;
      font-weight:${fw};
      text-align:${st.textAlign};
      letter-spacing:${st.letterSpacing}px;
      color:${isDiv ? 'transparent' : st.color};
      background:${bg};
      border:${border};
      border-radius:${st.borderRadius}px;
      padding:${padding};
      opacity:${st.opacity};
      overflow:hidden;
      line-height:1.4;
      font-family:'DM Sans',sans-serif;
      box-sizing:border-box;
      display:${display};
      align-items:${!isBlock ? 'center' : 'flex-start'};
      justify-content:${align};
      z-index:${el.zIndex};
    ">${content}</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Prescription — ${patientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#e2e8f0;display:flex;justify-content:center;padding:24px;}
    .page{width:${width}px;height:${height}px;background:${backgroundColor};position:relative;box-shadow:0 8px 48px rgba(0,0,0,0.18);}
    @media print{body{background:white;padding:0;}  .page{box-shadow:none;}}
  </style>
</head>
<body>
  <div class="page">${elementsHtml}</div>
  <script>window.onload=function(){window.print();};</script>
</body>
</html>`
}

// ── Default HTML (when no layout saved) ──────────────────────────────────────

function renderDefaultHtml(prescription: any, settings: any): string {
  const clinicName = settings?.clinicName || 'Medical Clinic'
  const doctorName = settings?.doctorName || prescription.doctor.name
  const specialty = settings?.doctorSpecialty || ''
  const address = settings?.address || ''
  const phone = settings?.phone || ''
  const footer = settings?.prescriptionFooter || 'This prescription is valid for 30 days from the date of issue.'
  const rxDate = format(new Date(prescription.date), 'MMMM d, yyyy')
  const rxId = prescription.id.slice(-8).toUpperCase()
  const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`
  const dob = prescription.patient.dateOfBirth ? format(new Date(prescription.patient.dateOfBirth), 'MMMM d, yyyy') : ''

  const itemsHtml = prescription.items.map((item: any, i: number) => `
    <div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #f1f5f9;">
      <div style="width:26px;height:26px;background:#e0f2fe;color:#0284c7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px;">${i + 1}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;">
          <span style="font-size:16px;font-weight:700;">${item.drugName}</span>
          <span style="font-size:13px;font-weight:600;color:#0284c7;">${item.dosage}</span>
        </div>
        <div style="display:flex;gap:20px;margin-top:4px;font-size:12px;color:#64748b;">
          <span><strong>Frequency:</strong> ${item.frequency}</span>
          <span><strong>Duration:</strong> ${item.duration}</span>
        </div>
        ${item.instructions ? `<div style="font-size:12px;color:#64748b;font-style:italic;margin-top:4px;">&#8627; ${item.instructions}</div>` : ''}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Prescription — ${patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#f8fafc;color:#0f172a;font-size:13px;line-height:1.5;}
    .page{max-width:794px;margin:0 auto;background:white;min-height:1123px;display:flex;flex-direction:column;box-shadow:0 0 40px rgba(0,0,0,.08);}
    @media print{body{background:white;}.page{box-shadow:none;}}
  </style>
</head>
<body>
  <div class="page">
    <div style="background:linear-gradient(135deg,#0284c7,#0891b2);padding:28px 36px;color:white;display:flex;justify-content:space-between;">
      <div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:600;">${clinicName}</div>
        <div style="font-size:13px;opacity:.85;margin-top:3px;">${doctorName}</div>
        ${specialty ? `<div style="font-size:11px;opacity:.7;margin-top:2px;font-style:italic;">${specialty}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:11px;opacity:.8;line-height:1.7;">
        ${address ? `<div>${address}</div>` : ''}
        ${phone ? `<div>${phone}</div>` : ''}
        <div style="font-size:10px;opacity:.6;margin-top:6px;font-family:monospace;letter-spacing:1px;">RX-${rxId}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:20px 36px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
      <div>
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:3px;">Patient</div>
        <div style="font-size:14px;font-weight:600;">${patientName}</div>
        ${dob ? `<div style="font-size:11px;color:#64748b;margin-top:1px;">DOB: ${dob}</div>` : ''}
        ${prescription.patient.phone ? `<div style="font-size:11px;color:#64748b;">${prescription.patient.phone}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:3px;">Date of Issue</div>
        <div style="font-size:14px;font-weight:600;">${rxDate}</div>
      </div>
    </div>
    <div style="padding:28px 36px;flex:1;">
      ${prescription.diagnosis ? `<div style="margin-bottom:24px;padding:12px 16px;background:#f0f9ff;border-left:3px solid #0284c7;border-radius:0 8px 8px 0;"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0369a1;margin-bottom:3px;">Diagnosis</div><div style="font-size:13px;font-weight:500;">${prescription.diagnosis}</div></div>` : ''}
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div style="font-family:'Playfair Display',serif;font-size:52px;color:#0284c7;line-height:1;">&#8478;</div>
        <div style="flex:1;height:1px;background:#e2e8f0;"></div>
      </div>
      ${itemsHtml}
      ${prescription.notes ? `<div style="margin-top:20px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#92400e;margin-bottom:4px;">Doctor's Notes</div><div style="font-size:12px;">${prescription.notes}</div></div>` : ''}
    </div>
    <div style="padding:20px 36px;display:flex;justify-content:flex-end;">
      <div style="text-align:right;">
        <div style="width:180px;height:60px;border-bottom:2px solid #0f172a;margin-bottom:8px;"></div>
        <div style="font-size:13px;font-weight:600;">${doctorName}</div>
        ${specialty ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${specialty}</div>` : ''}
      </div>
    </div>
    <div style="background:#f8fafc;padding:14px 36px;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="font-size:10px;color:#94a3b8;">${footer}</div>
    </div>
  </div>
  <script>window.onload=function(){window.print();};</script>
</body>
</html>`
}
