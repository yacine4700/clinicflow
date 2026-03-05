// src/components/finance/record-payment-dialog.tsx
'use client'

import { useState, useTransition } from 'react'
import { recordPayment } from '@/lib/actions/finance'
import { getPatients } from '@/lib/actions/patients'
import { X, DollarSign, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

export function RecordPaymentDialog({
  patientId: defaultPatientId,
  patientName,
  onClose,
  onRecord,
}: {
  patientId?: string
  patientName?: string
  onClose: () => void
  onRecord: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId || '')
  const [selectedPatientName, setSelectedPatientName] = useState(patientName || '')
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(!defaultPatientId)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'INSURANCE' | 'OTHER'>('CASH')
  const [description, setDescription] = useState('Consultation fee')
  const [searching, setSearching] = useState(false)

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setPatients([]); return }
    setSearching(true)
    const results = await getPatients(q)
    setPatients(results)
    setSearching(false)
  }

  const handleSubmit = () => {
    if (!selectedPatientId) { toast.error('Select a patient'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return }

    startTransition(async () => {
      try {
        await recordPayment({
          patientId: selectedPatientId,
          amount: parseFloat(amount),
          method,
          description,
        })
        toast.success(`Payment of $${amount} recorded`)
        onRecord()
      } catch {
        toast.error('Failed to record payment')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-foreground">Record Payment</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Patient */}
          {selectedPatientName && !showSearch ? (
            <div className="flex items-center justify-between bg-accent rounded-xl p-3">
              <div>
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium text-sm">{selectedPatientName}</p>
              </div>
              {!defaultPatientId && (
                <button onClick={() => setShowSearch(true)} className="text-xs text-primary hover:underline">Change</button>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Search Patient</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="input-field pl-8"
                  placeholder="Type patient name..."
                />
              </div>
              {patients.length > 0 && (
                <div className="mt-1 border border-border rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                  {patients.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPatientId(p.id); setSelectedPatientName(`${p.firstName} ${p.lastName}`); setShowSearch(false); setPatients([]) }}
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm border-b border-border last:border-0"
                    >
                      {p.firstName} {p.lastName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field pl-7"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {/* Quick amounts */}
            <div className="flex gap-1.5 mt-2">
              {[25, 50, 75, 100].map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  ${a}
                </button>
              ))}
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {(['CASH', 'CARD', 'INSURANCE', 'OTHER'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors border ${
                    method === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            Record Payment
          </button>
        </div>
      </div>
    </div>
  )
}
