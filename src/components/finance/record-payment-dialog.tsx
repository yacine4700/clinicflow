'use client'

import { useState, useTransition } from 'react'
import { recordPayment } from '@/lib/actions/finance'
import { getPatients } from '@/lib/actions/patients'
import { X, DollarSign, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useT, useFmt } from '@/components/providers/app-provider'

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
  const t = useT()
  const fmt = useFmt()
  const [isPending, startTransition] = useTransition()
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId || '')
  const [selectedPatientName, setSelectedPatientName] = useState(patientName || '')
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(!defaultPatientId)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'INSURANCE' | 'OTHER'>('CASH')
  const [description, setDescription] = useState(t('finance.consultationFeePlaceholder'))
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
    if (!selectedPatientId) { toast.error(t('finance.toast.selectPatient')); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error(t('finance.toast.invalidAmount')); return }

    startTransition(async () => {
      try {
        await recordPayment({
          patientId: selectedPatientId,
          amount: parseFloat(amount),
          method,
          description,
        })
        toast.success(t('finance.toast.paymentRecorded', { amount: fmt(parseFloat(amount)) }))
        onRecord()
      } catch {
        toast.error(t('finance.toast.error'))
      }
    })
  }

  const methodLabels: Record<string, string> = {
    CASH: t('finance.cash'),
    CARD: t('finance.card'),
    INSURANCE: t('finance.insurance'),
    OTHER: t('finance.other'),
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-foreground">{t('finance.recordPayment')}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {selectedPatientName && !showSearch ? (
            <div className="flex items-center justify-between bg-accent rounded-xl p-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('common.patient')}</p>
                <p className="font-medium text-sm">{selectedPatientName}</p>
              </div>
              {!defaultPatientId && (
                <button onClick={() => setShowSearch(true)} className="text-xs text-primary hover:underline">
                  {t('finance.changePatient')}
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('finance.searchPatient')}</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="input-field pl-8"
                  placeholder={t('finance.searchPatient')}
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </div>
              {patients.length > 0 && (
                <div className="mt-1 border border-border rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                  {patients.map((p) => (
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

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('finance.amount')}</label>
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
            <div className="flex gap-1.5 mt-2">
              {[1000, 2000, 3000, 5000].map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('finance.method')}</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {(['CASH', 'CARD', 'INSURANCE', 'OTHER'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors border ${
                    method === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                  }`}
                >
                  {methodLabels[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('common.description')}</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {t('finance.recordPayment')}
          </button>
        </div>
      </div>
    </div>
  )
}
