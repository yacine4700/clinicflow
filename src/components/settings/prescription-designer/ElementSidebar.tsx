'use client'
import React from 'react'
import { ELEMENT_ICONS, ELEMENT_LABELS, type ElementType } from '@/types/prescription-layout'

const GROUPS = [
  { label: 'Clinic Info', items: ['clinic-logo', 'clinic-name', 'clinic-address', 'clinic-phone', 'clinic-email'] as ElementType[] },
  { label: 'Doctor', items: ['doctor-name', 'doctor-specialty'] as ElementType[] },
  { label: 'Patient', items: ['patient-name', 'patient-age', 'date'] as ElementType[] },
  { label: 'Prescription', items: ['rx-symbol', 'drug-list', 'signature-block', 'footer-notes'] as ElementType[] },
  { label: 'Layout', items: ['divider'] as ElementType[] },
]

export function ElementSidebar({ onAddElement }: { onAddElement: (type: ElementType) => void }) {
  return (
    <div className="w-52 shrink-0 bg-card border-r border-border overflow-y-auto">
      <div className="p-3 border-b border-border sticky top-0 bg-card z-10">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Elements</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Click to add to canvas</p>
      </div>
      <div className="p-2 space-y-4">
        {GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(type => (
                <button key={type} onClick={() => onAddElement(type)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-left transition-all group">
                  <span className="text-base w-6 text-center flex-shrink-0">{ELEMENT_ICONS[type]}</span>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary truncate">{ELEMENT_LABELS[type]}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
