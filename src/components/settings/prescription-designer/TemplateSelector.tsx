'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import type { PrescriptionLayout } from '@/types/prescription-layout'
import { X, Check, Layout } from 'lucide-react'

const PREVIEWS = [
  { name: 'Classic Medical', desc: 'Colored header, patient bar, full drug table', icon: '🏥', accent: '#0284c7', features: ['Colored header', 'Drug table', 'Logo space'] },
  { name: 'Minimal Modern', desc: 'Centered title, clean typography, list medications', icon: '✦', accent: '#0f172a', features: ['Centered title', 'Drug list', 'Minimal'] },
  { name: 'Compact Print', desc: 'Small header, dense layout, fast printing', icon: '⚡', accent: '#334155', features: ['Small header', 'Compact', 'Dense'] },
]

export function TemplateSelector({ templates, currentTemplate, onSelect, onClose }: {
  templates: PrescriptionLayout[]
  currentTemplate: string
  onSelect: (t: PrescriptionLayout) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Layout className="w-5 h-5 text-primary" /> Choose a Template</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Select a starting layout — fully customizable after</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4">
          {templates.map((template, i) => {
            const p = PREVIEWS[i] ?? PREVIEWS[0]
            const isActive = template.templateName === currentTemplate
            return (
              <button key={template.templateName} onClick={() => onSelect(template)}
                className={cn('group text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg', isActive ? 'border-primary shadow-md shadow-primary/10' : 'border-border hover:border-primary/50')}>
                {/* Mini A4 preview */}
                <div className="bg-slate-50 p-3 h-48 relative">
                  <div className="w-full h-full bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div className="h-8" style={{ background: p.accent }} />
                    <div className="p-2 space-y-1.5">
                      <div className="h-2 rounded" style={{ background: `${p.accent}40`, width: '70%' }} />
                      <div className="h-1.5 rounded bg-slate-200" style={{ width: '50%' }} />
                      <div className="h-px bg-slate-200 my-1.5" />
                      {[80, 65, 90, 55].map((w, j) => (
                        <div key={j} className="h-1.5 rounded" style={{ background: j % 2 === 0 ? '#e2e8f0' : '#f1f5f9', width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                  {isActive && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  <div className="absolute bottom-3 right-3 text-xl">{p.icon}</div>
                </div>
                <div className="p-3 border-t border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{template.templateName}</p>
                    {isActive && <span className="text-xs text-primary font-medium">Active</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.features.map(f => <span key={f} className="text-[10px] px-1.5 py-0.5 bg-background border border-border rounded text-muted-foreground">{f}</span>)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  )
}
