// src/types/prescription-layout.ts

export type ElementType =
  | 'clinic-logo' | 'clinic-name' | 'clinic-address' | 'clinic-phone' | 'clinic-email'
  | 'doctor-name' | 'doctor-specialty'
  | 'patient-name' | 'patient-age' | 'date'
  | 'drug-list' | 'signature-block' | 'footer-notes'
  | 'divider' | 'rx-symbol'

export type DrugListMode = 'table' | 'list' | 'compact'
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'

export interface ElementStyle {
  fontSize: number
  fontWeight: FontWeight
  textAlign: TextAlign
  letterSpacing: number
  color: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  padding: number
  opacity: number
}

export interface DrugListConfig {
  mode: DrugListMode
  showDrugName: boolean
  showDosage: boolean
  showDuration: boolean
  showFrequency: boolean
  showInstructions: boolean
  rowSpacing: number
  headerBg: string
  stripedRows: boolean
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  locked: boolean
  zIndex: number
  style: ElementStyle
  drugListConfig?: DrugListConfig
  content?: string // for static text overrides
}

export interface CanvasSettings {
  width: number  // A4 = 794px at 96dpi
  height: number // A4 = 1123px
  gridEnabled: boolean
  gridSize: number
  snapToGrid: boolean
  zoom: number
  backgroundColor: string
  showGuides: boolean
}

export interface PrescriptionLayout {
  version: string
  canvasSettings: CanvasSettings
  elements: CanvasElement[]
  templateName: string
}

export const DEFAULT_STYLE: ElementStyle = {
  fontSize: 13,
  fontWeight: 'normal',
  textAlign: 'left',
  letterSpacing: 0,
  color: '#0f172a',
  backgroundColor: 'transparent',
  borderColor: '#e2e8f0',
  borderWidth: 0,
  borderRadius: 0,
  padding: 4,
  opacity: 1,
}

export const DEFAULT_DRUG_LIST_CONFIG: DrugListConfig = {
  mode: 'table',
  showDrugName: true,
  showDosage: true,
  showDuration: true,
  showFrequency: true,
  showInstructions: true,
  rowSpacing: 8,
  headerBg: '#f0f9ff',
  stripedRows: true,
}

export const ELEMENT_LABELS: Record<ElementType, string> = {
  'clinic-logo': 'Clinic Logo',
  'clinic-name': 'Clinic Name',
  'clinic-address': 'Address',
  'clinic-phone': 'Phone',
  'clinic-email': 'Email',
  'doctor-name': 'Doctor Name',
  'doctor-specialty': 'Specialty',
  'patient-name': 'Patient Name',
  'patient-age': 'Patient Age',
  'date': 'Date',
  'drug-list': 'Drug List',
  'signature-block': 'Signature',
  'footer-notes': 'Footer Notes',
  'divider': 'Divider Line',
  'rx-symbol': 'Rx Symbol',
}

export const ELEMENT_ICONS: Record<string, string> = {
  'clinic-logo': '🏥',
  'clinic-name': '🏢',
  'clinic-address': '📍',
  'clinic-phone': '📞',
  'clinic-email': '✉️',
  'doctor-name': '👨‍⚕️',
  'doctor-specialty': '🩺',
  'patient-name': '👤',
  'patient-age': '🎂',
  'date': '📅',
  'drug-list': '💊',
  'signature-block': '✍️',
  'footer-notes': '📝',
  'divider': '➖',
  'rx-symbol': '℞',
}

// A4 dimensions at 96dpi
export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

export const CLASSIC_TEMPLATE: PrescriptionLayout = {
  version: '1.0',
  templateName: 'Classic Medical',
  canvasSettings: {
    width: A4_WIDTH, height: A4_HEIGHT,
    gridEnabled: false, gridSize: 10,
    snapToGrid: true, zoom: 1,
    backgroundColor: '#ffffff', showGuides: true,
  },
  elements: [
    { id: 'h-bg', type: 'clinic-name', x: 0, y: 0, width: A4_WIDTH, height: 90, visible: true, locked: false, zIndex: 0, style: { ...DEFAULT_STYLE, backgroundColor: '#0284c7', color: '#ffffff', fontSize: 22, fontWeight: 'bold', textAlign: 'left', padding: 24 } },
    { id: 'cn', type: 'clinic-name', x: 24, y: 16, width: 360, height: 40, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 20, fontWeight: 'bold', color: '#ffffff' } },
    { id: 'dn', type: 'doctor-name', x: 24, y: 52, width: 360, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 12, color: '#bae6fd' } },
    { id: 'ca', type: 'clinic-address', x: 500, y: 16, width: 270, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, color: '#e0f2fe', textAlign: 'right' } },
    { id: 'cp', type: 'clinic-phone', x: 500, y: 38, width: 270, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, color: '#e0f2fe', textAlign: 'right' } },
    { id: 'ce', type: 'clinic-email', x: 500, y: 58, width: 270, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, color: '#e0f2fe', textAlign: 'right' } },
    { id: 'pn', type: 'patient-name', x: 24, y: 110, width: 360, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 14, fontWeight: 'semibold' } },
    { id: 'pa', type: 'patient-age', x: 400, y: 110, width: 180, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 13 } },
    { id: 'dt', type: 'date', x: 600, y: 110, width: 170, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 13, textAlign: 'right' } },
    { id: 'div1', type: 'divider', x: 24, y: 148, width: A4_WIDTH - 48, height: 2, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, backgroundColor: '#e2e8f0' } },
    { id: 'rx', type: 'rx-symbol', x: 24, y: 162, width: 60, height: 60, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 48, fontWeight: 'bold', color: '#0284c7' } },
    { id: 'dl', type: 'drug-list', x: 24, y: 234, width: A4_WIDTH - 48, height: 400, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE }, drugListConfig: { ...DEFAULT_DRUG_LIST_CONFIG, mode: 'table' } },
    { id: 'sig', type: 'signature-block', x: A4_WIDTH - 220, y: 680, width: 196, height: 80, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, borderWidth: 0 } },
    { id: 'fn', type: 'footer-notes', x: 24, y: A4_HEIGHT - 60, width: A4_WIDTH - 48, height: 40, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 10, color: '#94a3b8', textAlign: 'center', borderWidth: 1, borderColor: '#e2e8f0', padding: 8 } },
  ],
}

export const MODERN_TEMPLATE: PrescriptionLayout = {
  version: '1.0',
  templateName: 'Minimal Modern',
  canvasSettings: {
    width: A4_WIDTH, height: A4_HEIGHT,
    gridEnabled: false, gridSize: 10,
    snapToGrid: true, zoom: 1,
    backgroundColor: '#ffffff', showGuides: true,
  },
  elements: [
    { id: 'cn', type: 'clinic-name', x: 0, y: 32, width: A4_WIDTH, height: 36, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#0f172a', letterSpacing: 2 } },
    { id: 'ds', type: 'doctor-specialty', x: 0, y: 72, width: A4_WIDTH, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 12, textAlign: 'center', color: '#64748b', letterSpacing: 1 } },
    { id: 'div0', type: 'divider', x: A4_WIDTH / 2 - 40, y: 104, width: 80, height: 3, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, backgroundColor: '#0284c7', borderRadius: 2 } },
    { id: 'cp', type: 'clinic-phone', x: 0, y: 116, width: A4_WIDTH / 2, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, textAlign: 'right', color: '#64748b' } },
    { id: 'ce', type: 'clinic-email', x: A4_WIDTH / 2 + 8, y: 116, width: A4_WIDTH / 2 - 8, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, color: '#64748b' } },
    { id: 'pn', type: 'patient-name', x: 40, y: 160, width: 340, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 14, fontWeight: 'semibold' } },
    { id: 'dt', type: 'date', x: A4_WIDTH - 240, y: 160, width: 200, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 13, textAlign: 'right' } },
    { id: 'div1', type: 'divider', x: 40, y: 196, width: A4_WIDTH - 80, height: 1, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, backgroundColor: '#e2e8f0' } },
    { id: 'rx', type: 'rx-symbol', x: 40, y: 210, width: 50, height: 50, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 40, fontWeight: 'bold', color: '#0284c7' } },
    { id: 'dl', type: 'drug-list', x: 40, y: 270, width: A4_WIDTH - 80, height: 420, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE }, drugListConfig: { ...DEFAULT_DRUG_LIST_CONFIG, mode: 'list', stripedRows: false } },
    { id: 'dn', type: 'doctor-name', x: 40, y: 740, width: 300, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 13, fontWeight: 'semibold' } },
    { id: 'sig', type: 'signature-block', x: A4_WIDTH - 240, y: 720, width: 200, height: 80, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE } },
    { id: 'fn', type: 'footer-notes', x: 40, y: A4_HEIGHT - 56, width: A4_WIDTH - 80, height: 36, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 10, color: '#94a3b8', textAlign: 'center' } },
  ],
}

export const COMPACT_TEMPLATE: PrescriptionLayout = {
  version: '1.0',
  templateName: 'Compact Print',
  canvasSettings: {
    width: A4_WIDTH, height: A4_HEIGHT,
    gridEnabled: false, gridSize: 10,
    snapToGrid: true, zoom: 1,
    backgroundColor: '#ffffff', showGuides: true,
  },
  elements: [
    { id: 'cn', type: 'clinic-name', x: 24, y: 16, width: 420, height: 28, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 16, fontWeight: 'bold' } },
    { id: 'dn', type: 'doctor-name', x: 24, y: 46, width: 420, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, color: '#64748b' } },
    { id: 'cp', type: 'clinic-phone', x: A4_WIDTH - 240, y: 16, width: 216, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 11, textAlign: 'right', color: '#64748b' } },
    { id: 'ca', type: 'clinic-address', x: A4_WIDTH - 240, y: 38, width: 216, height: 20, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 10, textAlign: 'right', color: '#94a3b8' } },
    { id: 'div0', type: 'divider', x: 24, y: 72, width: A4_WIDTH - 48, height: 1, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, backgroundColor: '#0284c7' } },
    { id: 'pn', type: 'patient-name', x: 24, y: 84, width: 300, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 13, fontWeight: 'semibold' } },
    { id: 'pa', type: 'patient-age', x: 340, y: 84, width: 160, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 12 } },
    { id: 'dt', type: 'date', x: A4_WIDTH - 220, y: 84, width: 196, height: 24, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 12, textAlign: 'right' } },
    { id: 'div1', type: 'divider', x: 24, y: 116, width: A4_WIDTH - 48, height: 1, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, backgroundColor: '#e2e8f0' } },
    { id: 'rx', type: 'rx-symbol', x: 24, y: 126, width: 40, height: 40, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 34, fontWeight: 'bold', color: '#0284c7' } },
    { id: 'dl', type: 'drug-list', x: 24, y: 174, width: A4_WIDTH - 48, height: 500, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE }, drugListConfig: { ...DEFAULT_DRUG_LIST_CONFIG, mode: 'compact', stripedRows: false, rowSpacing: 4 } },
    { id: 'sig', type: 'signature-block', x: A4_WIDTH - 210, y: 720, width: 186, height: 70, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE } },
    { id: 'fn', type: 'footer-notes', x: 24, y: A4_HEIGHT - 48, width: A4_WIDTH - 48, height: 30, visible: true, locked: false, zIndex: 1, style: { ...DEFAULT_STYLE, fontSize: 9, color: '#94a3b8', textAlign: 'center' } },
  ],
}

export const BUILT_IN_TEMPLATES = [CLASSIC_TEMPLATE, MODERN_TEMPLATE, COMPACT_TEMPLATE]
