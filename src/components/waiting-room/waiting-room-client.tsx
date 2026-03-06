'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { callPatient, removeFromWaiting } from '@/lib/actions/waiting-room'
import { addToWaitingRoom } from '@/lib/actions/patients'
import { waitingDuration, cn } from '@/lib/utils'
import { Clock, UserPlus, Phone, AlertCircle, CheckCircle, X, RefreshCw, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { AddToWaitingDialog } from './add-to-waiting-dialog'
import { useT } from '@/components/providers/app-provider'

interface WaitingEntry {
  id: string
  patientId: string
  registeredAt: Date
  calledAt: Date | null
  status: string
  priority: number
  notes: string | null
  patient: { firstName: string; lastName: string; phone: string | null }
}

interface Stats { waiting: number; inConsult: number; done: number; total: number }

export function WaitingRoomClient({
  initialEntries, stats, isDoctor,
}: {
  initialEntries: WaitingEntry[]
  stats: Stats
  isDoctor: boolean
}) {
  const router = useRouter()
  const t = useT()
  const [entries, setEntries] = useState(initialEntries)
  const [currentStats, setStats] = useState(stats)
  const [isPending, startTransition] = useTransition()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTicks(n => n + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (ticks > 0) router.refresh()
  }, [ticks, router])

  const handleCall = (id: string, name: string) => {
    startTransition(async () => {
      const result = await callPatient(id)
      if (result.success) {
        toast.success(`${t('waitingRoom.callIn')} — ${name}`)
        router.refresh()
      }
    })
  }

  const handleDone = (id: string, status: 'DONE' | 'LEFT' = 'DONE') => {
    startTransition(async () => {
      const result = await removeFromWaiting(id, status)
      if (result.success) {
        toast.success(status === 'DONE' ? t('waitingRoom.markDone') : t('waitingRoom.markLeft'))
        router.refresh()
      }
    })
  }

  const statusConfig = {
    WAITING: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      dot: 'bg-amber-400',
      label: t('waitingRoom.waiting'),
    },
    IN_CONSULTATION: {
      color: 'bg-sky-100 text-sky-800 border-sky-200',
      dot: 'bg-sky-400',
      label: t('waitingRoom.inConsultation'),
    },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('waitingRoom.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('waitingRoom.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-accent text-muted-foreground transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isPending && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {t('waitingRoom.addPatient')}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t('waitingRoom.waiting'),  value: currentStats.waiting,  color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: t('waitingRoom.inConsult'),value: currentStats.inConsult, color: 'text-sky-600',     bg: 'bg-sky-50' },
          { label: t('waitingRoom.done'),      value: currentStats.done,     color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('waitingRoom.total'),     value: currentStats.total,    color: 'text-foreground',  bg: 'bg-muted/50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="clinic-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">{t('waitingRoom.currentQueue')}</h2>
            {currentStats.waiting > 0 && (
              <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center font-medium">
                {currentStats.waiting}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {t('common.live')}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Clock className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">{t('waitingRoom.noPatients')}</p>
            <p className="text-xs mt-1">{t('waitingRoom.emptySubtitle')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => {
              const status = statusConfig[entry.status as keyof typeof statusConfig]
              const isUrgent = entry.priority > 0
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-4 p-4 transition-colors',
                    isUrgent && 'bg-red-50/50 dark:bg-red-950/10',
                    entry.status === 'IN_CONSULTATION' && 'bg-sky-50/30 dark:bg-sky-950/10'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                    index === 0 && entry.status === 'WAITING' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">
                        {entry.patient.firstName} {entry.patient.lastName}
                      </p>
                      {isUrgent && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full urgent-pulse">
                          <AlertCircle className="w-3 h-3" />
                          {t('waitingRoom.priority')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {entry.patient.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {entry.patient.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {t('waitingRoom.waitingSince')} {waitingDuration(entry.registeredAt)}
                      </span>
                      {entry.notes && (
                        <span className="text-xs text-muted-foreground truncate">&ldquo;{entry.notes}&rdquo;</span>
                      )}
                    </div>
                  </div>

                  {status && (
                    <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${status.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {isDoctor && entry.status === 'WAITING' && (
                      <button
                        onClick={() => handleCall(entry.id, entry.patient.firstName)}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {t('waitingRoom.callIn')}
                      </button>
                    )}
                    {isDoctor && entry.status === 'IN_CONSULTATION' && (
                      <button
                        onClick={() => handleDone(entry.id, 'DONE')}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {t('waitingRoom.markDone')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDone(entry.id, 'LEFT')}
                      disabled={isPending}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title={t('waitingRoom.markLeft')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddDialog && (
        <AddToWaitingDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={() => { setShowAddDialog(false); router.refresh() }}
        />
      )}
    </div>
  )
}
