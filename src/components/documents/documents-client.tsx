// src/components/documents/documents-client.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Printer, X, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const DOC_TYPES = [
  { value: 'MEDICAL_LEAVE', label: 'Medical Leave Certificate', icon: '🏥' },
  { value: 'MEDICAL_LETTER', label: 'Medical Letter / Referral', icon: '📨' },
  { value: 'CERTIFICATE', label: 'Medical Certificate', icon: '📜' },
  { value: 'CUSTOM', label: 'Custom Document', icon: '📄' },
]

export function DocumentsClient({ documents, patients, doctorName }: {
  documents: any[]
  patients: any[]
  doctorName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [form, setForm] = useState({
    patientId: '',
    type: 'MEDICAL_LEAVE',
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    content: '',
    recipient: '',
  })

  const handleCreate = () => {
    if (!form.patientId || !form.title) { toast.error('Fill required fields'); return }

    startTransition(async () => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (response.ok) {
        toast.success('Document created')
        setShowCreate(false)
        router.refresh()
      } else {
        toast.error('Failed to create document')
      }
    })
  }

  const getDocTypeMeta = (type: string) => DOC_TYPES.find(t => t.value === type) || DOC_TYPES[3]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Documents</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Generate and manage patient documents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Document Type Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DOC_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => { setForm(f => ({ ...f, type: type.value, title: type.label })); setShowCreate(true) }}
            className="clinic-card p-4 text-left hover:shadow-md transition-shadow group"
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="clinic-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm text-foreground">Recent Documents</h2>
        </div>
        {documents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No documents created yet</p>
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
                    Print PDF
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
              <h2 className="font-semibold text-foreground">Create Document</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, title: DOC_TYPES.find(t => t.value === e.target.value)?.label || '' }))} className="input-field mt-1">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Patient *</label>
                <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-field mt-1">
                  <option value="">Select patient...</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field mt-1" />
              </div>

              {form.type === 'MEDICAL_LEAVE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">From</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">To</label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field mt-1" />
                  </div>
                </div>
              )}

              {(form.type === 'MEDICAL_LETTER' || form.type === 'CERTIFICATE') && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Addressed to (if applicable)</label>
                  <input value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} className="input-field mt-1" placeholder="To whom it may concern" />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">Content / Notes</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input-field mt-1" rows={4} placeholder="Document content..." />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Create Document
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
                  Print
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
              <p className="text-sm leading-relaxed">
                {typeof selectedDoc.content === 'string' ? selectedDoc.content : JSON.stringify(selectedDoc.content, null, 2)}
              </p>
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
