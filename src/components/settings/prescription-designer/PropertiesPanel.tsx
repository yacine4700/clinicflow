'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import type { CanvasElement, CanvasSettings, FontWeight, TextAlign } from '@/types/prescription-layout'
import { ELEMENT_ICONS, ELEMENT_LABELS } from '@/types/prescription-layout'
import { AlignLeft, AlignCenter, AlignRight, Trash2, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react'

interface Props {
  element: CanvasElement | null
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onUpdateStyle: (id: string, style: Partial<CanvasElement['style']>) => void
  onUpdateDrugConfig: (id: string, config: Record<string, unknown>) => void
  onRemove: (id: string) => void
  canvasSettings: CanvasSettings
  onUpdateCanvas: (updates: Partial<CanvasSettings>) => void
}

function Label({ children }: { children?: React.ReactNode }) {
  return <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{children}</label>
}

function NumberInput({ value, onChange, min, max, step = 1, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; label?: string; children?: React.ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input type="number" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
        min={min} max={max} step={step}
        className="w-full px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
  )
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string; children?: React.ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-border" />
        <input type="text" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <p className="text-xs font-bold text-foreground mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function PropertiesPanel({ element, onUpdateElement, onUpdateStyle, onUpdateDrugConfig, onRemove, canvasSettings, onUpdateCanvas }: Props) {
  if (!element) {
    return (
      <div className="w-60 shrink-0 bg-card border-l border-border overflow-y-auto">
        <div className="p-3 border-b border-border sticky top-0 bg-card z-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Properties</p>
        </div>
        <div className="p-4 space-y-4">
          <Section title="Canvas Settings">
            <NumberInput label="Grid Size" value={canvasSettings.gridSize} onChange={v => onUpdateCanvas({ gridSize: v })} min={5} max={50} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Grid Lines</span>
              <button onClick={() => onUpdateCanvas({ gridEnabled: !canvasSettings.gridEnabled })} className={cn('w-9 h-5 rounded-full transition-colors relative', canvasSettings.gridEnabled ? 'bg-primary' : 'bg-muted')}>
                <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', canvasSettings.gridEnabled ? 'left-4' : 'left-0.5')} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Snap to Grid</span>
              <button onClick={() => onUpdateCanvas({ snapToGrid: !canvasSettings.snapToGrid })} className={cn('w-9 h-5 rounded-full transition-colors relative', canvasSettings.snapToGrid ? 'bg-primary' : 'bg-muted')}>
                <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', canvasSettings.snapToGrid ? 'left-4' : 'left-0.5')} />
              </button>
            </div>
            <ColorInput label="Background" value={canvasSettings.backgroundColor} onChange={v => onUpdateCanvas({ backgroundColor: v })} />
          </Section>
          <div className="text-center py-6">
            <p className="text-2xl mb-2">👆</p>
            <p className="text-xs text-muted-foreground">Click an element on the canvas to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  const s = element.style
  const cfg = element.drugListConfig

  return (
    <div className="w-60 shrink-0 bg-card border-l border-border overflow-y-auto">
      <div className="p-3 border-b border-border sticky top-0 bg-card z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{ELEMENT_ICONS[element.type]}</span>
            <p className="text-xs font-bold text-foreground">{ELEMENT_LABELS[element.type]}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onUpdateElement(element.id, { visible: !element.visible })} className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground">
              {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onUpdateElement(element.id, { locked: !element.locked })} className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground">
              {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onRemove(element.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="X" value={Math.round(element.x)} onChange={v => onUpdateElement(element.id, { x: v })} min={0} />
            <NumberInput label="Y" value={Math.round(element.y)} onChange={v => onUpdateElement(element.id, { y: v })} min={0} />
            <NumberInput label="Width" value={Math.round(element.width)} onChange={v => onUpdateElement(element.id, { width: v })} min={10} />
            <NumberInput label="Height" value={Math.round(element.height)} onChange={v => onUpdateElement(element.id, { height: v })} min={2} />
          </div>
        </Section>

        {element.type !== 'divider' && (
          <Section title="Typography">
            <NumberInput label="Font Size" value={s.fontSize} onChange={v => onUpdateStyle(element.id, { fontSize: v })} min={6} max={72} />
            <div>
              <Label>Font Weight</Label>
              <div className="grid grid-cols-4 gap-1">
                {(['normal', 'medium', 'semibold', 'bold'] as FontWeight[]).map(w => (
                  <button key={w} onClick={() => onUpdateStyle(element.id, { fontWeight: w })}
                    className={cn('py-1 rounded text-[10px] border transition-colors', s.fontWeight === w ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent')}>
                    {w === 'normal' ? '400' : w === 'medium' ? '500' : w === 'semibold' ? '600' : '700'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Alignment</Label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as TextAlign[]).map(a => (
                  <button key={a} onClick={() => onUpdateStyle(element.id, { textAlign: a })}
                    className={cn('flex-1 py-1.5 rounded border transition-colors flex items-center justify-center', s.textAlign === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent')}>
                    {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
            <NumberInput label="Letter Spacing" value={s.letterSpacing} onChange={v => onUpdateStyle(element.id, { letterSpacing: v })} min={-2} max={20} step={0.5} />
          </Section>
        )}

        <Section title="Colors">
          {element.type !== 'divider' && <ColorInput label="Text Color" value={s.color} onChange={v => onUpdateStyle(element.id, { color: v })} />}
          <ColorInput label={element.type === 'divider' ? 'Line Color' : 'Background'} value={element.type === 'divider' ? (s.backgroundColor || '#e2e8f0') : s.backgroundColor} onChange={v => onUpdateStyle(element.id, { backgroundColor: v })} />
        </Section>

        {element.type !== 'divider' && (
          <Section title="Border">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Width" value={s.borderWidth} onChange={v => onUpdateStyle(element.id, { borderWidth: v })} min={0} max={10} />
              <NumberInput label="Radius" value={s.borderRadius} onChange={v => onUpdateStyle(element.id, { borderRadius: v })} min={0} max={50} />
            </div>
            {s.borderWidth > 0 && <ColorInput label="Border Color" value={s.borderColor} onChange={v => onUpdateStyle(element.id, { borderColor: v })} />}
          </Section>
        )}

        <Section title="Spacing & Layer">
          {element.type !== 'divider' && <NumberInput label="Padding" value={s.padding} onChange={v => onUpdateStyle(element.id, { padding: v })} min={0} max={40} />}
          <div>
            <Label>Opacity</Label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.05} value={s.opacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateStyle(element.id, { opacity: parseFloat(e.target.value) })} className="flex-1 accent-primary" />
              <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(s.opacity * 100)}%</span>
            </div>
          </div>
          <div>
            <Label>Layer Order</Label>
            <div className="flex gap-2">
              <button onClick={() => onUpdateElement(element.id, { zIndex: element.zIndex + 1 })} className="flex-1 py-1.5 border border-border rounded-lg text-xs hover:bg-accent flex items-center justify-center gap-1 transition-colors">
                <ChevronUp className="w-3.5 h-3.5" /> Forward
              </button>
              <button onClick={() => onUpdateElement(element.id, { zIndex: Math.max(0, element.zIndex - 1) })} className="flex-1 py-1.5 border border-border rounded-lg text-xs hover:bg-accent flex items-center justify-center gap-1 transition-colors">
                <ChevronDown className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </div>
        </Section>

        {element.type === 'drug-list' && cfg && (
          <Section title="Drug List Settings">
            <div>
              <Label>Display Mode</Label>
              <div className="space-y-1">
                {[{ value: 'table', label: 'Table', desc: 'Grid columns layout' }, { value: 'list', label: 'List', desc: 'One line per drug' }, { value: 'compact', label: 'Compact', desc: 'Ultra-minimal' }].map(m => (
                  <button key={m.value} onClick={() => onUpdateDrugConfig(element.id, { mode: m.value })}
                    className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors', cfg.mode === m.value ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent')}>
                    <div>
                      <p className="text-xs font-medium">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Visible Columns</Label>
              <div className="space-y-1.5">
                {[{ key: 'showDrugName', label: 'Drug Name' }, { key: 'showDosage', label: 'Dosage' }, { key: 'showFrequency', label: 'Frequency' }, { key: 'showDuration', label: 'Duration' }, { key: 'showInstructions', label: 'Instructions' }].map(col => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{col.label}</span>
                    <button onClick={() => onUpdateDrugConfig(element.id, { [col.key]: !(cfg as unknown as Record<string, unknown>)[col.key] })}
                      className={cn('w-9 h-5 rounded-full transition-colors relative', (cfg as unknown as Record<string, unknown>)[col.key] ? 'bg-primary' : 'bg-muted')}>
                      <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', (cfg as unknown as Record<string, unknown>)[col.key] ? 'left-4' : 'left-0.5')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <NumberInput label="Row Spacing" value={cfg.rowSpacing} onChange={v => onUpdateDrugConfig(element.id, { rowSpacing: v })} min={0} max={24} />
            <ColorInput label="Header Background" value={cfg.headerBg} onChange={v => onUpdateDrugConfig(element.id, { headerBg: v })} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Striped Rows</span>
              <button onClick={() => onUpdateDrugConfig(element.id, { stripedRows: !cfg.stripedRows })}
                className={cn('w-9 h-5 rounded-full transition-colors relative', cfg.stripedRows ? 'bg-primary' : 'bg-muted')}>
                <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', cfg.stripedRows ? 'left-4' : 'left-0.5')} />
              </button>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
