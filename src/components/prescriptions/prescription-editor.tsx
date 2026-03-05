// src/components/prescriptions/prescription-editor.tsx
'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPrescription, searchDrugs } from '@/lib/actions/prescriptions'
import { Plus, Trash2, ArrowLeft, Loader2, FileText, Save, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DrugItem {
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface Patient { id: string; firstName: string; lastName: string }
interface Template { id: string; name: string; items: DrugItem[] }
interface Settings { clinicName: string; doctorName: string; consultationPrice: number }

export function PrescriptionEditor({
  patients, templates, doctorName, settings, defaultPatientId,
}: {
  patients: Patient[]
  templates: Template[]
  doctorName: string
  settings: Settings | null
  defaultPatientId?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [patientId, setPatientId] = useState(defaultPatientId || '')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DrugItem[]>([
    { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [drugSuggestions, setDrugSuggestions] = useState<any[]>([])
  const [activeSearch, setActiveSearch] = useState<number | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const searchForDrugs = useCallback(async (query: string, index: number) => {
    if (query.length < 2) { setDrugSuggestions([]); return }
    setSearchLoading(true)
    setActiveSearch(index)
    const results = await searchDrugs(query)
    setDrugSuggestions(results)
    setSearchLoading(false)
  }, [])

  const updateItem = (index: number, field: keyof DrugItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    if (field === 'drugName') searchForDrugs(value, index)
  }

  const selectDrug = (index: number, drug: any) => {
    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      drugName: drug.name,
      dosage: drug.commonDosages[0] || '',
    } : item))
    setDrugSuggestions([])
    setActiveSearch(null)
  }

  const addItem = () => setItems(prev => [...prev, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const applyTemplate = (template: Template) => {
    setItems(template.items.map(item => ({ ...item, instructions: item.instructions || '' })))
    toast.success(`Template "${template.name}" applied`)
  }

  const handleSubmit = () => {
    if (!patientId) { toast.error('Please select a patient'); return }
    const validItems = items.filter(i => i.drugName && i.dosage && i.frequency && i.duration)
    if (validItems.length === 0) { toast.error('Add at least one complete medication'); return }

    startTransition(async () => {
      try {
        const result = await createPrescription({ patientId, diagnosis, notes, items: validItems })
        if (result.success) {
          toast.success('Prescription created')
          router.push(`/prescriptions/${result.prescription.id}`)
        }
      } catch {
        toast.error('Failed to create prescription')
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Prescription</h1>
          <p className="text-muted-foreground text-sm">Dr. {doctorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Patient Selection */}
          <div className="clinic-card p-5">
            <h2 className="font-semibold text-sm text-foreground mb-3">Patient</h2>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="input-field"
            >
              <option value="">Select patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>

            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground">Diagnosis / Reason</label>
              <input
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="input-field mt-1"
                placeholder="e.g., Upper respiratory tract infection"
              />
            </div>
          </div>

          {/* Medications */}
          <div className="clinic-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-foreground">Medications</h2>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add Drug
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative bg-muted/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Drug {index + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Drug Name with autocomplete */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={item.drugName}
                        onChange={e => updateItem(index, 'drugName', e.target.value)}
                        onBlur={() => setTimeout(() => { setDrugSuggestions([]); setActiveSearch(null) }, 200)}
                        className="input-field pl-8"
                        placeholder="Drug name (type to search)"
                      />
                    </div>
                    {activeSearch === index && drugSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden max-h-40 overflow-y-auto">
                        {drugSuggestions.map(drug => (
                          <button
                            key={drug.id}
                            onClick={() => selectDrug(index, drug)}
                            className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b border-border last:border-0"
                          >
                            <p className="text-sm font-medium text-foreground">{drug.name}</p>
                            <p className="text-xs text-muted-foreground">{drug.category} · {drug.genericName}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Dosage</label>
                      <input
                        value={item.dosage}
                        onChange={e => updateItem(index, 'dosage', e.target.value)}
                        className="input-field mt-0.5"
                        placeholder="500mg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Frequency</label>
                      <select
                        value={item.frequency}
                        onChange={e => updateItem(index, 'frequency', e.target.value)}
                        className="input-field mt-0.5"
                      >
                        <option value="">Select...</option>
                        {['Once daily', '2x/day', '3x/day', '4x/day', 'Every 8h', 'Every 12h', 'PRN', 'Once at night', 'Once before breakfast'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Duration</label>
                      <select
                        value={item.duration}
                        onChange={e => updateItem(index, 'duration', e.target.value)}
                        className="input-field mt-0.5"
                      >
                        <option value="">Select...</option>
                        {['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months', 'Ongoing'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Instructions (optional)</label>
                    <input
                      value={item.instructions}
                      onChange={e => updateItem(index, 'instructions', e.target.value)}
                      className="input-field mt-0.5"
                      placeholder="Take after meals, with water..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="clinic-card p-5">
            <h2 className="font-semibold text-sm text-foreground mb-3">Additional Notes</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Special instructions, follow-up advice..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Prescription
            </button>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="space-y-4">
          <div className="clinic-card p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Templates
            </h3>
            {templates.length === 0 ? (
              <p className="text-xs text-muted-foreground">No templates saved</p>
            ) : (
              <div className="space-y-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent transition-colors border border-border"
                  >
                    <p className="text-sm font-medium text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(template.items as DrugItem[]).length} medications</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
