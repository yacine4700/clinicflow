// src/components/patients/add-patient-dialog.tsx
'use client'

import { useState, useTransition } from 'react'
import { createPatient } from '@/lib/actions/patients'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, UserPlus, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
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

export function AddPatientDialog({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [showMedical, setShowMedical] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { hasFile: false },
  })

  const hasFile = watch('hasFile')

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createPatient(data as any)
      if (result.success) {
        toast.success(`${data.firstName} ${data.lastName} registered`)
        onAdd()
      }
    } catch (e) {
      toast.error('Failed to register patient')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Register New Patient</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">First Name *</label>
                <input {...register('firstName')} className="input-field" placeholder="John" />
                {errors.firstName && <p className="text-destructive text-xs mt-0.5">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Name *</label>
                <input {...register('lastName')} className="input-field" placeholder="Doe" />
                {errors.lastName && <p className="text-destructive text-xs mt-0.5">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                <input {...register('dateOfBirth')} type="date" className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <select {...register('gender')} className="input-field">
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input {...register('phone')} className="input-field" placeholder="+1 555 0100" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Blood Type</label>
                <select {...register('bloodType')} className="input-field">
                  <option value="">Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">National ID</label>
              <input {...register('nationalId')} className="input-field" placeholder="Optional" />
            </div>

            {/* Medical File Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <input
                {...register('hasFile')}
                type="checkbox"
                id="hasFile"
                className="w-4 h-4 text-primary rounded cursor-pointer"
                onChange={() => setShowMedical(!showMedical)}
              />
              <label htmlFor="hasFile" className="cursor-pointer">
                <p className="text-sm font-medium text-foreground">Create Medical File</p>
                <p className="text-xs text-muted-foreground">For follow-up patients requiring a permanent record</p>
              </label>
            </div>

            {/* Medical File Fields */}
            {showMedical && (
              <div className="space-y-3 p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900">
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide">Medical Information</p>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Chief Complaint</label>
                  <input {...register('chiefComplaint')} className="input-field" placeholder="Main reason for visit" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Medical History</label>
                  <textarea {...register('medicalHistory')} className="input-field" rows={2} placeholder="Past conditions, surgeries..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Current Medications</label>
                  <input {...register('currentMeds')} className="input-field" placeholder="List current medications" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 p-5 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
