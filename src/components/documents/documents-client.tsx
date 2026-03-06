'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Printer, X, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useT } from '@/components/providers/app-provider'

export function DocumentsClient({ documents, patients, doctorName }: {
  documents: { id: string; title: string; type: string; date: Date; patient: { firstName: string; lastName: string }; doctor?: { name: string } }[]
  patients: { id: string; firstName: string; lastName: string }[]
  doctorName: string
}) {
  const router = useRouter()
  const t = useT()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null)
  const [form, setForm] = useState({
    patientId: '', type: 'MEDICAL_LEAVE', title: '',
    startDate: '', endDate: '', reason: '', content: '', recipient: '',
  })

  const DOC_TYPES = [
    { value: 'MEDICAL_LEAVE',   label: t('documents.medicalLeave'),  icon: '🏥' },
    { value: 'MEDICAL_LETTER',  label: t('documents.medicalLetter'), icon: '📨' },
    { value: 'CERTIFICATE',     label: t('documents.certificate'),   icon: '📜' },
    { value: 'CUSTOM',          label: t('documents.custom'),        icon: '📄' },
  ]

  const handleCreate = () => {
    if (!form.patientId || !form.title) { toast.error(t('documents.fillRequired')); return }
    startTransition(async () => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (response.ok) {
        toast.success(t('documents.created'))
        setShowCreate(false)
        router.refresh()
      } else {
        toast.error(t('documents.failed'))
      }
    })
  }

  const getDocTypeMeta = (type: string) => DOC_TYPES.find(d => d.value === type) || DOC_TYPES[3]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('documents.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('documents.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('documents.newDocument')}
        </button>
      </div>

      {/* Documents List */}
      <div className="clinic-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm text-foreground">{t('documents.recentDocuments')}</h2>
        </div>
        {documents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{t('documents.noDocuments')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map(doc => {
              const meta = getDocTypeMeta(doc.type)
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.patient.firstName} {doc.patient.lastName} · {formatDate(doc.date)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/print/document/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {t('documents.printPdf')}
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">{t('documents.createDocument')}</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('documents.selectType')}</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value, title: DOC_TYPES.find(d => d.value === e.target.value)?.label || '' }))}
                  className="input-field mt-1"
                >
                  {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('common.patient')} *</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  className="input-field mt-1"
                >
                  <option value="">{t('documents.selectPatient')}</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('documents.title_field')} *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-field mt-1"
                />
              </div>

              {form.type === 'MEDICAL_LEAVE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('documents.startDate')}</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{t('documents.endDate')}</label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field mt-1" />
                  </div>
                </div>
              )}

              {(form.type === 'MEDICAL_LETTER' || form.type === 'CERTIFICATE') && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('documents.recipient')}</label>
                  <input
                    value={form.recipient}
                    onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                    className="input-field mt-1"
                    placeholder={t('documents.recipientPlaceholder')}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('documents.content_field')}</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input-field mt-1"
                  rows={4}
                  placeholder={t('documents.contentPlaceholder')}
                />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {t('documents.createDocument')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Dialog */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border no-print">
              <h3 className="font-semibold">{selectedDoc.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                  <Printer className="w-3.5 h-3.5" />
                  {t('documents.print')}
                </button>
                <button onClick={() => setSelectedDoc(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">{selectedDoc.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(selectedDoc.date)}</p>
              </div>
              <div className="mt-8 flex justify-end">
                <div className="text-center">
                  <div className="w-40 h-12 border-b-2 border-foreground mb-1" />
                  <p className="text-sm font-medium">{selectedDoc.doctor?.name || doctorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
