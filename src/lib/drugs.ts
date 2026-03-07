// src/lib/drugs.ts
// Client-side drug search from /public/data/drugs.json
// No database needed — reads JSON file directly

export interface Drug {
  name: string
  dci: string        // International Nonproprietary Name
  dosage: string
  form: string
  laboratory: string
}

export interface DrugSearchResult extends Drug {
  /** Highlighted label combining name + dosage + form */
  label: string
}

let cachedDrugs: Drug[] | null = null

async function loadDrugs(): Promise<Drug[]> {
  if (cachedDrugs) return cachedDrugs
  const res = await fetch('/data/drugs.json')
  const json = await res.json()
  cachedDrugs = (json.active_drugs ?? []) as Drug[]
  return cachedDrugs
}

/** Search active drugs by name, DCI, form, or laboratory — case-insensitive */
export async function searchDrugsLocal(query: string): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return []
  const drugs = await loadDrugs()
  const q = query.toLowerCase().trim()

  const matches = drugs.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.dci.toLowerCase().includes(q) ||
    d.form.toLowerCase().includes(q) ||
    d.laboratory.toLowerCase().includes(q)
  )

  // Sort: exact name match first, then starts-with, then rest
  matches.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    if (aName === q && bName !== q) return -1
    if (bName === q && aName !== q) return 1
    if (aName.startsWith(q) && !bName.startsWith(q)) return -1
    if (bName.startsWith(q) && !aName.startsWith(q)) return 1
    return aName.localeCompare(bName)
  })

  return matches.slice(0, 12).map(d => ({
    ...d,
    label: `${d.name} ${d.dosage} — ${d.form}`,
  }))
}

/** Get all unique DCI names for a given drug name (for generic alternatives) */
export async function getDrugVariants(name: string): Promise<Drug[]> {
  const drugs = await loadDrugs()
  return drugs.filter(d => d.name.toLowerCase() === name.toLowerCase())
}
