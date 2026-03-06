'use client'

import { useState, useTransition } from 'react'
import { getPatients, addToWaitingRoom } from '@/lib/actions/patients'
import { X, Search, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useT } from '@/components/providers/app-provider'

interface Patient { id: string; firstName: string; lastName: string; phone: string | null }

export function AddToWaitingDialog({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const [notes, setNotes] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [searching, setSearching] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setPatients([]); return }
    setSearching(true)
    const results = await getPatients(q)
    setPatients(results as Patient[])
    setSearching(false)
  }

  const handleAdd = () => {
    if (!selected) return
    startTransition(async () => {
      const result = await addToWaitingRoom(selected.id, notes, urgent ? 1 : 0)
      if (result.success) {
        toast.success(`${selected.firstName} ${selected.lastName} — ${t('waitingRoom.addToQueue')}`)
        onAdd()
      } else {
        toast.error(result.error || t('common.noData'))
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t('waitingRoom.addToWaiting')}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={t('waitingRoom.searchPatient')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  autoFocus
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
              </div>

              {patients.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left transition-colors border-b border-border last:border-0"
                    >
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p>
                        {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {search.length >= 2 && patients.length === 0 && !searching && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('waitingRoom.noResults')}{' '}
                  <a href="/patients" className="text-primary hover:underline">{t('waitingRoom.registerNew')}</a>
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-accent rounded-xl p-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{selected.firstName} {selected.lastName}</p>
                  {selected.phone && <p className="text-xs text-muted-foreground">{selected.phone}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('waitingRoom.addNote')}</label>
                <input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('waitingRoom.noteHint')}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={e => setUrgent(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{t('waitingRoom.markAsUrgent')}</p>
                  <p className="text-xs text-muted-foreground">{t('waitingRoom.urgentHint')}</p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
            {t('common.cancel')}
          </button>
          {selected && (
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {t('waitingRoom.addToQueue')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
