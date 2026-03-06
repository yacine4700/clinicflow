'use client'
import React, { useState, useCallback, useTransition } from 'react'
import { toast } from 'sonner'
import { Save, Loader2, Eye, Layout, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateClinicSettings } from '@/lib/actions/finance'
import type { PrescriptionLayout, CanvasElement } from '@/types/prescription-layout'
import { BUILT_IN_TEMPLATES, CLASSIC_TEMPLATE, DEFAULT_STYLE, DEFAULT_DRUG_LIST_CONFIG, ELEMENT_LABELS, A4_WIDTH } from '@/types/prescription-layout'
import { TemplateSelector } from './TemplateSelector'
import { ElementSidebar } from './ElementSidebar'
import { CanvasEditor } from './CanvasEditor'
import { PropertiesPanel } from './PropertiesPanel'

interface Props {
  initialLayout?: PrescriptionLayout | null
  clinicSettings: Record<string, string | number | boolean | null | undefined> | null
}

export function PrescriptionDesigner({ initialLayout, clinicSettings }: Props) {
  const [layout, setLayout] = useState<PrescriptionLayout>(initialLayout ?? CLASSIC_TEMPLATE)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(!initialLayout)
  const [showPreview, setShowPreview] = useState(false)
  const [isPending, startTransition] = useTransition()

  const selectedElement = layout.elements.find((e: CanvasElement) => e.id === selectedId) ?? null

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setLayout((prev: PrescriptionLayout) => ({
      ...prev,
      elements: prev.elements.map((el: CanvasElement) => el.id === id ? { ...el, ...updates } : el),
    }))
  }, [])

  const updateElementStyle = useCallback((id: string, styleUpdates: Partial<CanvasElement['style']>) => {
    setLayout((prev: PrescriptionLayout) => ({
      ...prev,
      elements: prev.elements.map((el: CanvasElement) =>
        el.id === id ? { ...el, style: { ...el.style, ...styleUpdates } } : el
      ),
    }))
  }, [])

  const updateElementDrugConfig = useCallback((id: string, configUpdates: Record<string, unknown>) => {
    setLayout((prev: PrescriptionLayout) => ({
      ...prev,
      elements: prev.elements.map((el: CanvasElement) =>
        el.id === id ? { ...el, drugListConfig: { ...el.drugListConfig!, ...configUpdates } } : el
      ),
    }))
  }, [])

  const addElement = useCallback((type: CanvasElement['type']) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      x: 40,
      y: 200 + layout.elements.length * 10,
      width: type === 'drug-list' ? 700 : type === 'divider' ? A4_WIDTH - 48 : type === 'rx-symbol' ? 60 : type === 'clinic-logo' ? 80 : 300,
      height: type === 'drug-list' ? 300 : type === 'divider' ? 2 : type === 'rx-symbol' ? 60 : type === 'clinic-logo' ? 80 : type === 'signature-block' ? 80 : type === 'footer-notes' ? 40 : 28,
      visible: true, locked: false, zIndex: layout.elements.length + 1,
      style: { ...DEFAULT_STYLE },
      ...(type === 'drug-list' && { drugListConfig: { ...DEFAULT_DRUG_LIST_CONFIG } }),
    }
    setLayout((prev: PrescriptionLayout) => ({ ...prev, elements: [...prev.elements, newEl] }))
    setSelectedId(newEl.id)
    toast.success(`${ELEMENT_LABELS[type]} added`)
  }, [layout.elements])

  const removeElement = useCallback((id: string) => {
    setLayout((prev: PrescriptionLayout) => ({ ...prev, elements: prev.elements.filter((e: CanvasElement) => e.id !== id) }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const updateCanvas = useCallback((updates: Partial<PrescriptionLayout['canvasSettings']>) => {
    setLayout((prev: PrescriptionLayout) => ({ ...prev, canvasSettings: { ...prev.canvasSettings, ...updates } }))
  }, [])

  const applyTemplate = useCallback((template: PrescriptionLayout) => {
    setLayout(template)
    setSelectedId(null)
    setShowTemplates(false)
    toast.success(`Template "${template.templateName}" applied`)
  }, [])

  const saveLayout = () => {
    startTransition(async () => {
      try {
        await updateClinicSettings({ prescriptionLayout: layout as unknown as Record<string, unknown> })
        toast.success('Layout saved successfully')
      } catch {
        toast.error('Failed to save layout')
      }
    })
  }

  return (
    <div className="flex flex-col" style={{ height: '82vh' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Layout className="w-4 h-4 text-primary" /> Layout Designer
          </span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{layout.templateName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">
            <Layout className="w-3.5 h-3.5" /> Templates
          </button>
          <button onClick={() => { setLayout(CLASSIC_TEMPLATE); setSelectedId(null); toast.success('Reset to Classic') }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors', showPreview ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent')}>
            <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Editing' : 'Preview'}
          </button>
          <button onClick={saveLayout} disabled={isPending} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Layout
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {!showPreview && <ElementSidebar onAddElement={addElement} />}
        <div className="flex-1 overflow-auto">
          <CanvasEditor
            layout={layout} selectedId={selectedId} onSelect={setSelectedId}
            onUpdateElement={updateElement} onUpdateCanvas={updateCanvas}
            onRemoveElement={removeElement} clinicSettings={clinicSettings ?? {}}
            previewMode={showPreview}
          />
        </div>
        {!showPreview && (
          <PropertiesPanel
            element={selectedElement} onUpdateElement={updateElement}
            onUpdateStyle={updateElementStyle} onUpdateDrugConfig={updateElementDrugConfig}
            onRemove={removeElement} canvasSettings={layout.canvasSettings}
            onUpdateCanvas={updateCanvas}
          />
        )}
      </div>

      {showTemplates && (
        <TemplateSelector
          templates={BUILT_IN_TEMPLATES} currentTemplate={layout.templateName}
          onSelect={applyTemplate} onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}
