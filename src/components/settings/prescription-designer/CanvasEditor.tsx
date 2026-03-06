'use client'
import React, { useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Trash2, Lock, Eye, EyeOff, ZoomIn, ZoomOut, Grid } from 'lucide-react'
import type { PrescriptionLayout, CanvasElement, CanvasSettings } from '@/types/prescription-layout'
import { ELEMENT_LABELS, A4_WIDTH, A4_HEIGHT } from '@/types/prescription-layout'

interface CanvasEditorProps {
  layout: PrescriptionLayout
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onUpdateCanvas: (updates: Partial<CanvasSettings>) => void
  onRemoveElement: (id: string) => void
  clinicSettings: Record<string, string | number | boolean | null | undefined>
  previewMode: boolean
}

function DrugListPreview({ el }: { el: CanvasElement }) {
  const cfg = el.drugListConfig
  const drugs = [
    { name: 'Amoxicillin', dosage: '500mg', frequency: '3x/day', duration: '7 days' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'PRN', duration: '5 days' },
    { name: 'Paracetamol', dosage: '500mg', frequency: '3x/day', duration: '5 days' },
  ]
  const mode = cfg?.mode ?? 'table'
  const cols = [cfg?.showDrugName !== false && '2fr', cfg?.showDosage !== false && '1fr', cfg?.showDuration !== false && '1fr'].filter(Boolean).join(' ')

  if (mode === 'table') {
    return (
      <div style={{ width: '100%', fontFamily: 'DM Sans,sans-serif', fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, background: cfg?.headerBg ?? '#f0f9ff' }}>
          {cfg?.showDrugName !== false && <div style={{ padding: '4px 8px', fontWeight: 600, color: '#0369a1' }}>Drug Name</div>}
          {cfg?.showDosage !== false && <div style={{ padding: '4px 8px', fontWeight: 600, color: '#0369a1' }}>Dosage</div>}
          {cfg?.showDuration !== false && <div style={{ padding: '4px 8px', fontWeight: 600, color: '#0369a1' }}>Duration</div>}
        </div>
        {drugs.map((d, i) => (
          <div key={d.name} style={{ display: 'grid', gridTemplateColumns: cols, background: cfg?.stripedRows && i % 2 === 1 ? '#f8fafc' : 'transparent', marginBottom: (cfg?.rowSpacing ?? 0) / 2 }}>
            {cfg?.showDrugName !== false && <div style={{ padding: '3px 8px' }}>{i + 1}. {d.name}</div>}
            {cfg?.showDosage !== false && <div style={{ padding: '3px 8px', color: '#0284c7' }}>{d.dosage}</div>}
            {cfg?.showDuration !== false && <div style={{ padding: '3px 8px', color: '#64748b' }}>{d.duration}</div>}
          </div>
        ))}
      </div>
    )
  }
  if (mode === 'list') {
    return (
      <div style={{ width: '100%', fontFamily: 'DM Sans,sans-serif' }}>
        {drugs.map((d, i) => (
          <div key={d.name} style={{ fontSize: 11, paddingBottom: cfg?.rowSpacing ?? 6, borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: 600 }}>{i + 1}. {d.name}</span>
            {cfg?.showDosage !== false && <span style={{ color: '#0284c7' }}> {d.dosage}</span>}
            {cfg?.showFrequency !== false && <span style={{ color: '#64748b' }}> — {d.frequency}</span>}
            {cfg?.showDuration !== false && <span style={{ color: '#64748b' }}> · {d.duration}</span>}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ width: '100%', fontFamily: 'DM Sans,sans-serif' }}>
      {drugs.map((d, i) => (
        <div key={d.name} style={{ display: 'flex', gap: 8, fontSize: 11, paddingBottom: 2 }}>
          <span style={{ color: '#94a3b8', minWidth: 16 }}>{i + 1}.</span>
          <span style={{ fontWeight: 600, flex: 1 }}>{d.name}</span>
          {cfg?.showDosage !== false && <span style={{ color: '#0284c7' }}>{d.dosage}</span>}
          {cfg?.showDuration !== false && <span style={{ color: '#64748b', fontSize: 10 }}>— {d.duration}</span>}
        </div>
      ))}
    </div>
  )
}

function ElementContent({ el, cs }: { el: CanvasElement; cs: Record<string, string | number | boolean | null | undefined> }) {
  switch (el.type) {
    case 'clinic-name':      return <>{String(cs.clinicName ?? 'Clinic Name')}</>
    case 'clinic-address':   return <>{String(cs.address ?? '123 Medical Street, City')}</>
    case 'clinic-phone':     return <>{String(cs.phone ?? '+1 (555) 123-4567')}</>
    case 'clinic-email':     return <>{String(cs.email ?? 'clinic@example.com')}</>
    case 'doctor-name':      return <>{cs.doctorName ? `Dr. ${cs.doctorName}` : 'Dr. Sarah Mitchell'}</>
    case 'doctor-specialty': return <>{String(cs.doctorSpecialty ?? 'General Medicine')}</>
    case 'patient-name':     return <>Patient: John Doe</>
    case 'patient-age':      return <>Age: 35</>
    case 'date':             return <>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>
    case 'rx-symbol':        return <span style={{ lineHeight: 1 }}>&#8478;</span>
    case 'divider':          return null
    case 'clinic-logo':      return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,132,199,0.08)', border: '2px dashed rgba(2,132,199,0.3)', borderRadius: 6 }}>
        <span style={{ fontSize: Math.min(el.height * 0.5, 40) }}>&#127973;</span>
      </div>
    )
    case 'signature-block':  return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ flex: 1, borderBottom: `1.5px solid ${el.style.color ?? '#334155'}`, marginBottom: 4 }} />
        <p style={{ fontSize: Math.max(el.style.fontSize - 2, 9), color: el.style.color ?? '#0f172a', fontFamily: 'DM Sans' }}>
          {cs.doctorName ? `Dr. ${cs.doctorName}` : 'Dr. Name'}
        </p>
        <p style={{ fontSize: Math.max(el.style.fontSize - 3, 8), color: '#94a3b8', fontFamily: 'DM Sans' }}>
          {String(cs.doctorSpecialty ?? 'Physician')}
        </p>
      </div>
    )
    case 'footer-notes':     return <>{String(cs.prescriptionFooter ?? 'This prescription is valid for 30 days.')}</>
    case 'drug-list':        return <DrugListPreview el={el} />
    default:                 return <>{ELEMENT_LABELS[el.type]}</>
  }
}

function ResizeHandle({ dir, onDown }: { dir: string; onDown: (e: React.MouseEvent, dir: string) => void }) {
  const pos: Record<string, React.CSSProperties> = {
    nw: { top: -4, left: -4, cursor: 'nw-resize' },
    n:  { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    ne: { top: -4, right: -4, cursor: 'ne-resize' },
    e:  { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
    se: { bottom: -4, right: -4, cursor: 'se-resize' },
    s:  { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    sw: { bottom: -4, left: -4, cursor: 'sw-resize' },
    w:  { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
  }
  return (
    <div
      onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); onDown(e, dir) }}
      style={{ position: 'absolute', width: 8, height: 8, background: '#fff', border: '2px solid #0284c7', borderRadius: 2, zIndex: 200, ...pos[dir] }}
    />
  )
}

export function CanvasEditor({ layout, selectedId, onSelect, onUpdateElement, onUpdateCanvas, onRemoveElement, clinicSettings, previewMode }: CanvasEditorProps) {
  const drag = useRef<{ type: 'drag' | 'resize'; elId: string; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number; dir: string } | null>(null)
  const { zoom, gridEnabled, gridSize, snapToGrid, backgroundColor } = layout.canvasSettings
  const snap = useCallback((v: number) => snapToGrid ? Math.round(v / gridSize) * gridSize : v, [snapToGrid, gridSize])

  const startDrag = useCallback((e: React.MouseEvent, el: CanvasElement) => {
    if (previewMode || el.locked) return
    e.preventDefault(); e.stopPropagation()
    onSelect(el.id)
    drag.current = { type: 'drag', elId: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.width, oh: el.height, dir: '' }
  }, [previewMode, onSelect])

  const startResize = useCallback((e: React.MouseEvent, el: CanvasElement, dir: string) => {
    if (previewMode) return
    e.preventDefault(); e.stopPropagation()
    drag.current = { type: 'resize', elId: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.width, oh: el.height, dir }
  }, [previewMode])

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      const d = drag.current; if (!d) return
      const dx = (e.clientX - d.sx) / zoom
      const dy = (e.clientY - d.sy) / zoom
      if (d.type === 'drag') {
        onUpdateElement(d.elId, { x: snap(Math.max(0, d.ox + dx)), y: snap(Math.max(0, d.oy + dy)) })
      } else {
        let nx = d.ox, ny = d.oy, nw = d.ow, nh = d.oh
        if (d.dir.includes('e')) nw = snap(Math.max(20, d.ow + dx))
        if (d.dir.includes('s')) nh = snap(Math.max(4, d.oh + dy))
        if (d.dir.includes('w')) { nx = snap(d.ox + dx); nw = snap(Math.max(20, d.ow - dx)) }
        if (d.dir.includes('n')) { ny = snap(d.oy + dy); nh = snap(Math.max(4, d.oh - dy)) }
        onUpdateElement(d.elId, { x: nx, y: ny, width: nw, height: nh })
      }
    }
    const up = () => { drag.current = null }
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up) }
  }, [zoom, snap, onUpdateElement])

  const sorted = [...layout.elements].sort((a, b) => a.zIndex - b.zIndex)
  const cs = clinicSettings as Record<string, string | number | boolean | null | undefined>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => onUpdateCanvas({ zoom: Math.max(0.5, +(zoom - 0.1).toFixed(1)) })} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button onClick={() => onUpdateCanvas({ zoom: Math.min(1.5, +(zoom + 0.1).toFixed(1)) })} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="w-px h-4 bg-border" />
        <button onClick={() => onUpdateCanvas({ gridEnabled: !gridEnabled })} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors', gridEnabled ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent')}>
          <Grid className="w-3.5 h-3.5" /> Grid
        </button>
        <button onClick={() => onUpdateCanvas({ snapToGrid: !snapToGrid })} className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors', snapToGrid ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent')}>
          Snap {snapToGrid ? 'On' : 'Off'}
        </button>
        <div className="ml-auto text-xs text-muted-foreground">
          A4 {A4_WIDTH}&times;{A4_HEIGHT}px &middot; {sorted.filter(e => e.visible).length} elements
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8" style={{ background: '#cbd5e1' }} onClick={() => !previewMode && onSelect(null)}>
        <div
          style={{
            width: A4_WIDTH * zoom, height: A4_HEIGHT * zoom, flexShrink: 0, position: 'relative',
            background: backgroundColor, boxShadow: '0 8px 48px rgba(0,0,0,0.22)',
            backgroundImage: gridEnabled ? 'linear-gradient(to right,rgba(148,163,184,0.25) 1px,transparent 1px),linear-gradient(to bottom,rgba(148,163,184,0.25) 1px,transparent 1px)' : 'none',
            backgroundSize: gridEnabled ? `${gridSize * zoom}px ${gridSize * zoom}px` : 'auto',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: A4_WIDTH, height: A4_HEIGHT, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {sorted.map(el => {
              if (!el.visible && previewMode) return null
              const isSelected = el.id === selectedId
              const st = el.style
              const isDiv = el.type === 'divider'
              const isBlock = ['drug-list', 'signature-block', 'clinic-logo'].includes(el.type)
              const fw = st.fontWeight === 'normal' ? 400 : st.fontWeight === 'medium' ? 500 : st.fontWeight === 'semibold' ? 600 : 700

              return (
                <div
                  key={el.id}
                  onMouseDown={(e: React.MouseEvent) => startDrag(e, el)}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (!previewMode) onSelect(el.id) }}
                  style={{
                    position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height,
                    fontSize: st.fontSize, fontWeight: fw, textAlign: st.textAlign,
                    letterSpacing: st.letterSpacing,
                    color: isDiv ? 'transparent' : st.color,
                    background: isDiv ? (st.backgroundColor ?? '#e2e8f0') : st.backgroundColor,
                    border: st.borderWidth > 0 ? `${st.borderWidth}px solid ${st.borderColor}` : 'none',
                    borderRadius: st.borderRadius, padding: isBlock ? 0 : st.padding, opacity: st.opacity,
                    zIndex: el.zIndex, cursor: previewMode ? 'default' : el.locked ? 'not-allowed' : 'move',
                    userSelect: 'none', overflow: 'hidden', lineHeight: 1.4, fontFamily: 'DM Sans,sans-serif',
                    boxSizing: 'border-box', outline: isSelected && !previewMode ? '2px solid #0284c7' : 'none', outlineOffset: 1,
                    display: isBlock ? 'block' : 'flex', alignItems: 'center',
                    justifyContent: !isBlock ? (st.textAlign === 'center' ? 'center' : st.textAlign === 'right' ? 'flex-end' : 'flex-start') : undefined,
                  }}
                >
                  <ElementContent el={el} cs={cs} />

                  {isSelected && !previewMode && !el.locked && (
                    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => (
                      <React.Fragment key={dir}>
                        <ResizeHandle dir={dir} onDown={(e, d) => startResize(e, el, d)} />
                      </React.Fragment>
                    ))
                  )}

                  {isSelected && !previewMode && (
                    <div onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} style={{ position: 'absolute', top: -26, left: 0, zIndex: 300, display: 'flex', alignItems: 'center', gap: 1, background: '#0284c7', borderRadius: 6, padding: '2px 4px 2px 8px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 9, color: 'white', fontFamily: 'DM Sans', marginRight: 4 }}>
                        {ELEMENT_LABELS[el.type]} &middot; {Math.round(el.x)},{Math.round(el.y)}
                      </span>
                      <button onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); onUpdateElement(el.id, { visible: !el.visible }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '1px 3px', display: 'flex', alignItems: 'center' }}>
                        {el.visible ? <Eye style={{ width: 11, height: 11 }} /> : <EyeOff style={{ width: 11, height: 11 }} />}
                      </button>
                      <button onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); onUpdateElement(el.id, { locked: !el.locked }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '1px 3px', display: 'flex', alignItems: 'center' }}>
                        <Lock style={{ width: 11, height: 11 }} />
                      </button>
                      <button onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); onRemoveElement(el.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '1px 3px', display: 'flex', alignItems: 'center' }}>
                        <Trash2 style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  )}

                  {!el.visible && !previewMode && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(148,163,184,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #94a3b8' }}>
                      <EyeOff style={{ width: 12, height: 12, color: '#94a3b8' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
