// src/app/api/print/document/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [doc, settings] = await Promise.all([
    prisma.document.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: { select: { name: true } },
      },
    }),
    prisma.clinicSettings.findUnique({ where: { id: 'default' } }),
  ])

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const clinicName = settings?.clinicName || 'Medical Clinic'
  const doctorName = settings?.doctorName || doc.doctor.name
  const specialty = settings?.doctorSpecialty || ''
  const address = settings?.address || ''
  const phone = settings?.phone || ''
  const docDate = format(new Date(doc.date), 'MMMM d, yyyy')
  const patientName = `${doc.patient.firstName} ${doc.patient.lastName}`
  const content = doc.content as any

  const getDocContent = () => {
    switch (doc.type) {
      case 'MEDICAL_LEAVE':
        return `
          <p>This is to certify that <strong>${patientName}</strong>, 
          ${doc.patient.dateOfBirth ? `born on ${format(new Date(doc.patient.dateOfBirth), 'MMMM d, yyyy')},` : ''}
          is under my medical care and has been advised to take medical leave.</p>
          ${content.startDate ? `<p><strong>Leave Period:</strong> From ${format(new Date(content.startDate), 'MMMM d, yyyy')} to ${content.endDate ? format(new Date(content.endDate), 'MMMM d, yyyy') : 'TBD'}</p>` : ''}
          ${content.reason ? `<p><strong>Reason:</strong> ${content.reason}</p>` : ''}
          <p>The patient is advised to rest and avoid strenuous activities during this period.</p>
        `
      case 'MEDICAL_LETTER':
        return `
          ${content.recipient ? `<p><strong>To:</strong> ${content.recipient}</p><br/>` : ''}
          <p>Dear ${content.recipient || 'Sir/Madam'},</p><br/>
          <p>I am writing to inform you regarding my patient, <strong>${patientName}</strong>.</p>
          ${content.content ? `<p>${content.content}</p>` : ''}
        `
      case 'CERTIFICATE':
        return `
          <p>This is to certify that <strong>${patientName}</strong> 
          ${doc.patient.dateOfBirth ? `(DOB: ${format(new Date(doc.patient.dateOfBirth), 'MMMM d, yyyy')})` : ''}
          was examined and found to be ${content.content || 'in good health'}.</p>
        `
      default:
        return `<p>${content.content || ''}</p>`
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${doc.title} - ${patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.6;
    }

    .page {
      max-width: 794px;
      margin: 0 auto;
      background: white;
      min-height: 1123px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 40px rgba(0,0,0,0.08);
    }

    .header {
      background: linear-gradient(135deg, #0284c7 0%, #0891b2 100%);
      padding: 28px 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .clinic-name {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 600;
    }

    .doctor-info {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 4px;
      line-height: 1.6;
    }

    .header-right {
      text-align: right;
      font-size: 11px;
      opacity: 0.8;
      line-height: 1.7;
    }

    .body {
      padding: 40px;
      flex: 1;
    }

    .doc-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      color: #0284c7;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .doc-date {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 32px;
    }

    .divider {
      width: 60px;
      height: 3px;
      background: #0284c7;
      margin: 0 auto 32px;
      border-radius: 2px;
    }

    .content {
      font-size: 14px;
      line-height: 1.8;
      color: #1e293b;
    }

    .content p {
      margin-bottom: 12px;
    }

    .content strong {
      color: #0f172a;
    }

    .signature-area {
      padding: 32px 40px;
      display: flex;
      justify-content: flex-end;
    }

    .signature-block {
      text-align: right;
    }

    .signature-line {
      width: 180px;
      height: 60px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 8px;
    }

    .signature-name {
      font-size: 13px;
      font-weight: 600;
    }

    .signature-title {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .footer {
      background: #f8fafc;
      padding: 14px 40px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }

    .stamp-area {
      margin-top: 40px;
      display: flex;
      justify-content: flex-start;
    }

    .stamp {
      width: 100px;
      height: 100px;
      border: 2px dashed #94a3b8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      padding: 8px;
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="clinic-name">${clinicName}</div>
        <div class="doctor-info">
          ${doctorName}<br/>
          ${specialty ? specialty + '<br/>' : ''}
          ${address}<br/>
          ${phone}
        </div>
      </div>
      <div class="header-right">
        <div>Date: ${docDate}</div>
        <div style="opacity:0.6;font-size:10px;font-family:monospace;margin-top:4px;">
          DOC-${doc.id.slice(-8).toUpperCase()}
        </div>
      </div>
    </div>

    <div class="body">
      <div class="doc-title">${doc.title}</div>
      <div class="doc-date">${docDate}</div>
      <div class="divider"></div>

      <div class="content">
        ${getDocContent()}
      </div>

      <div class="stamp-area">
        <div class="stamp">Official<br/>Stamp</div>
      </div>
    </div>

    <div class="signature-area">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${doctorName}</div>
        ${specialty ? `<div class="signature-title">${specialty}</div>` : ''}
      </div>
    </div>

    <div class="footer">
      ${clinicName} · ${address} · ${phone}
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
