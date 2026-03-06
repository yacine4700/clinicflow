'use client'

import { useState, useTransition } from 'react'
import { createPatient } from '@/lib/actions/patients'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useT } from '@/components/providers/app-provider'

export function AddPatientDialog({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const t = useT()
  const [showMedical, setShowMedical] = useState(false)

  const schema = z.object({
    firstName: z.string().min(1, t('common.required')),
    lastName: z.string().min(1, t('common.required')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    nationalId: z.string().optional(),
    bloodType: z.string().optional(),
    hasFile: z.boolean().optional(),
    chiefComplaint: z.string().optional(),
    medicalHistory: z.string().optional(),
    currentMeds: z.string().optional(),
  })

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { hasFile: false },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createPatient(data as Parameters<typeof createPatient>[0])
      if (result.success) {
        toast.success(`${data.firstName} ${data.lastName} — ${t('patients.registerPatient')}`)
        onAdd()
      }
    } catch {
      toast.error(t('common.noData'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t('patients.registerPatient')}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('patients.firstName')} *</label>
                <input {...register('firstName')} className="input-field" placeholder="Jean" />
                {errors.firstName && <p className="text-destructive text-xs mt-0.5">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('patients.lastName')} *</label>
                <input {...register('lastName')} className="input-field" placeholder="Dupont" />
                {errors.lastName && <p className="text-destructive text-xs mt-0.5">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('patients.dateOfBirth')}</label>
                <input {...register('dateOfBirth')} type="date" className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('patients.gender')}</label>
                <select {...register('gender')} className="input-field">
                  <option value="">{t('patients.selectGender')}</option>
                  <option value="MALE">{t('patients.male')}</option>
                  <option value="FEMALE">{t('patients.female')}</option>
                  <option value="OTHER">{t('patients.other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('common.phone')}</label>
                <input {...register('phone')} className="input-field" placeholder="+213 555 0100" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('patients.bloodType')}</label>
                <select {...register('bloodType')} className="input-field">
                  <option value="">{t('patients.bloodTypeUnknown')}</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('patients.nationalId')}</label>
              <input {...register('nationalId')} className="input-field" placeholder={t('common.optional')} />
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <input
                {...register('hasFile')}
                type="checkbox"
                id="hasFile"
                className="w-4 h-4 text-primary rounded cursor-pointer"
                onChange={() => setShowMedical(!showMedical)}
              />
              <label htmlFor="hasFile" className="cursor-pointer">
                <p className="text-sm font-medium text-foreground">{t('patients.hasFile')}</p>
                <p className="text-xs text-muted-foreground">{t('patients.hasFileDesc')}</p>
              </label>
            </div>

            {showMedical && (
              <div className="space-y-3 p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900">
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide">{t('patients.medicalInfo')}</p>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('patients.chiefComplaint')}</label>
                  <input {...register('chiefComplaint')} className="input-field" placeholder={t('patients.chiefComplaintPlaceholder')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('patients.medicalHistory')}</label>
                  <textarea {...register('medicalHistory')} className="input-field" rows={2} placeholder={t('patients.medicalHistoryPlaceholder')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('patients.currentMedications')}</label>
                  <input {...register('currentMeds')} className="input-field" placeholder={t('patients.currentMedicationsPlaceholder')} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 p-5 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {t('patients.registerPatient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
