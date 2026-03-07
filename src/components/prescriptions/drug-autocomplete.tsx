'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, Pill, X, ChevronRight } from 'lucide-react'
import { searchDrugsLocal, type DrugSearchResult } from '@/lib/drugs'
import { cn } from '@/lib/utils'
import { useT } from '@/components/providers/app-provider'

interface DrugAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (drug: DrugSearchResult) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function DrugAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  autoFocus,
}: DrugAutocompleteProps) {
  const t = useT()
  const [results, setResults] = useState<DrugSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    const res = await searchDrugsLocal(q)
    setResults(res)
    setOpen(res.length > 0)
    setActiveIndex(-1)
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    onChange(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 150)
  }

  const handleSelect = (drug: DrugSearchResult) => {
    onChange(drug.name)
    onSelect(drug)
    setOpen(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('[data-drug-autocomplete]')?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const FORM_COLORS: Record<string, string> = {
    'comprimé': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'gélule': 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'solution': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    'sirop': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    'injectable': 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    'suspension': 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    'crème': 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    'gel': 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    'poudre': 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    'aérosol': 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  }

  const getFormColor = (form: string) => {
    const lower = form.toLowerCase()
    for (const [key, cls] of Object.entries(FORM_COLORS)) {
      if (lower.includes(key)) return cls
    }
    return 'bg-muted text-muted-foreground'
  }

  // Highlight matching text
  const highlight = (text: string, query: string) => {
    if (!query || query.length < 2) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary font-semibold rounded">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div data-drug-autocomplete className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? t('prescriptions.searchDrug')}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className="input-field pl-8 pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={() => { onChange(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
        >
          {results.map((drug, i) => (
            <button
              key={`${drug.name}-${drug.dosage}-${i}`}
              type="button"
              onClick={() => handleSelect(drug)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border last:border-0',
                i === activeIndex ? 'bg-primary/5' : 'hover:bg-accent'
              )}
            >
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Pill className="w-3.5 h-3.5 text-primary" />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {highlight(drug.name, value)}
                  </span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium shrink-0', getFormColor(drug.form))}>
                    {drug.form}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-primary font-medium">{drug.dosage}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground italic truncate">
                    {highlight(drug.dci, value)}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground truncate">{drug.laboratory}</span>
                </div>
              </div>

              <ChevronRight className={cn('w-3.5 h-3.5 flex-shrink-0 transition-colors', i === activeIndex ? 'text-primary' : 'text-muted-foreground')} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
