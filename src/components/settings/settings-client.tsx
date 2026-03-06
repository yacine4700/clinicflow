'use client'
import React from 'react'
// src/components/settings/settings-client.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateClinicSettings } from '@/lib/actions/finance'
import { Building, FileText, Loader2, Save, Layout } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PrescriptionDesigner } from './prescription-designer/PrescriptionDesigner'
import type { PrescriptionLayout } from '@/types/prescription-layout'

interface ClinicSettings {
  clinicName: string; doctorName: string; doctorSpecialty?: string
  address?: string; phone?: string; email?: string
  consultationPrice: number; currency: string
  prescriptionHeader?: string; prescriptionFooter?: string
  requireMedicalFile: boolean
}

interface SettingsClientProps {
  settings: (ClinicSettings & { prescriptionLayout?: PrescriptionLayout }) | null
  templates: any[]
}

export function SettingsClient({ settings, templates }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'clinic' | 'prescription' | 'layout' | 'templates'>('clinic')
  const [form, setForm] = useState<ClinicSettings>({
    clinicName: settings?.clinicName || 'My Clinic',
    doctorName: settings?.doctorName || '',
    doctorSpecialty: settings?.doctorSpecialty || '',
    address: settings?.address || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    consultationPrice: settings?.consultationPrice || 75,
    currency: settings?.currency || 'USD',
    prescriptionHeader: settings?.prescriptionHeader || '',
    prescriptionFooter: settings?.prescriptionFooter || '',
    requireMedicalFile: settings?.requireMedicalFile || false,
  })

  const update = (key: keyof ClinicSettings, value: unknown) => setForm((f: ClinicSettings) => ({ ...f, [key]: value }))

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateClinicSettings(form)
        toast.success('Settings saved')
        router.refresh()
      } catch {
        toast.error('Failed to save settings')
      }
    })
  }

  const tabs = [
    { id: 'clinic',       label: 'Clinic Info',   icon: Building },
    { id: 'prescription', label: 'Prescription',  icon: FileText },
    { id: 'layout',       label: 'Layout Designer', icon: Layout },
    { id: 'templates',    label: 'Templates',     icon: FileText },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure your clinic preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Clinic Info ─────────────────────────────────────────────────── */}
      {activeTab === 'clinic' && (
        <div className="clinic-card p-6 space-y-5 max-w-3xl">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Clinic Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Clinic Name</label>
              <input value={form.clinicName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('clinicName', e.target.value)} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Doctor's Full Name</label>
              <input value={form.doctorName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('doctorName', e.target.value)} className="input-field mt-1" placeholder="Dr. John Smith" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Specialty</label>
              <input value={form.doctorSpecialty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('doctorSpecialty', e.target.value)} className="input-field mt-1" placeholder="General Medicine" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('phone', e.target.value)} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('email', e.target.value)} className="input-field mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Address</label>
            <input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('address', e.target.value)} className="input-field mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Default Consultation Price</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input type="number" value={form.consultationPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('consultationPrice', parseFloat(e.target.value))} className="input-field pl-7" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <select value={form.currency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('currency', e.target.value)} className="input-field mt-1">
                {['USD', 'EUR', 'GBP', 'DZD', 'MAD', 'TND'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <input type="checkbox" id="requireFile" checked={form.requireMedicalFile} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('requireMedicalFile', e.target.checked)} className="w-4 h-4 text-primary rounded cursor-pointer" />
            <label htmlFor="requireFile" className="cursor-pointer">
              <p className="text-sm font-medium text-foreground">Require Medical File</p>
              <p className="text-xs text-muted-foreground">All new patients must have a medical file</p>
            </label>
          </div>
        </div>
      )}

      {/* ── Prescription (header/footer text) ──────────────────────────── */}
      {activeTab === 'prescription' && (
        <div className="clinic-card p-6 space-y-5 max-w-3xl">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Prescription Text
          </h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Header Text</label>
            <input value={form.prescriptionHeader} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('prescriptionHeader', e.target.value)} className="input-field mt-1" placeholder="e.g., MediCare Clinic — Dr. Smith, MD" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Footer / Validity Note</label>
            <textarea value={form.prescriptionFooter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('prescriptionFooter', e.target.value)} className="input-field mt-1" rows={3} placeholder="Validity note, legal disclaimer..." />
          </div>
          {/* Quick preview */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">Quick Preview</p>
            <div className="bg-card border border-border rounded-lg overflow-hidden text-sm">
              <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-white text-xs">
                {form.prescriptionHeader || `${form.clinicName} — ${form.doctorName}`}
              </div>
              <div className="px-4 py-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Patient: John Doe</span>
                  <span>Date: Today</span>
                </div>
                <p className="text-lg font-bold text-sky-600">&#8478;</p>
                <p className="text-xs mt-1">1. Paracetamol 500mg — 3x/day — 5 days</p>
              </div>
              <div className="bg-muted/30 px-4 py-1.5 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">{form.prescriptionFooter || 'Footer appears here'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Layout Designer ─────────────────────────────────────────────── */}
      {activeTab === 'layout' && (
        <div className="clinic-card overflow-hidden" style={{ minHeight: '80vh' }}>
          <PrescriptionDesigner
            initialLayout={settings?.prescriptionLayout || null}
            clinicSettings={settings as unknown as Record<string, string | number | boolean | null | undefined>}
          />
        </div>
      )}

      {/* ── Templates ──────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="clinic-card overflow-hidden max-w-3xl">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Saved Prescription Templates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drug templates created from the prescription editor</p>
          </div>
          {templates.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates saved yet</p>
              <p className="text-xs">Create templates from the New Prescription page</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description} · {(t.items as any[]).length} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save button — not on layout tab (it has its own save) */}
      {activeTab !== 'layout' && activeTab !== 'templates' && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      )}
    </div>
  )
}
