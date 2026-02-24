import { useState, useEffect } from 'react'
import {
  CL_TOKEN, CL_BASE, CL_CACHE_TTL_MS,
  loadClCache, saveClCache,
} from '../data/courtlistenerConfig'
import { CL_CASES_DATA } from '../data/clCasesData'

// ── Use the fast search endpoint instead of the slow dockets filter ───────────
// The search API uses Solr and responds in < 1s vs. the dockets endpoint which
// does a full database scan and can take 30-60+ seconds.
//
// Field name differences (search API returns camelCase):
//   caseName          ← case_name
//   dateFiled         ← date_filed
//   dateTerminated    ← date_terminated
//   court_id          ← same
//   court_citation_string  ← abbreviation like "N.D.N.Y."
//   suitNature        ← nature_of_suit
//   juryDemand        ← jury_demand
//   jurisdictionType  ← jurisdiction_type
//   assignedTo        ← assigned_to_str
//   referredTo        ← referred_to_str
//   docket_absolute_url    ← direct link to docket page

async function searchCL(docketNumber) {
  // Quote the docket number for an exact match query
  const q   = `"${docketNumber}"`
  const url = `${CL_BASE}/search/?q=${encodeURIComponent(q)}&type=d&format=json`
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${CL_TOKEN}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`CourtListener search returned HTTP ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}

// ── Pick the most likely Trump-administration case from search results ─────────
// Multiple courts can share the same docket number. We filter to 2025+ cases and
// prefer those with government defendants (DHS, DOJ, Trump, OPM, etc.)
const GOV_KEYWORDS = [
  'trump', 'dhs', 'doj', 'doge', 'opm', 'fbi', 'cia', 'ice', 'cbp',
  'state department', 'department of', 'secretary', 'attorney general',
  'noem', 'rubio', 'hegseth', 'bondi', 'vought', 'musk',
  'united states', 'u.s.', 'federal', 'president', 'administration',
  'executive', 'agency', 'bureau', 'office of',
]

function scoreResult(r) {
  const text = [
    r.caseName ?? '',
    ...(r.party ?? []),
  ].join(' ').toLowerCase()

  // Must be 2025 or later (Trump's second term started Jan 20, 2025)
  if (!r.dateFiled || r.dateFiled < '2025-01-01') return -1

  let score = 0
  for (const kw of GOV_KEYWORDS) {
    if (text.includes(kw)) score++
  }
  return score
}

function pickBestResult(results, docketNumber) {
  if (!results.length) return null

  // First try: exact docket number match in 2025+, ranked by government relevance
  const candidates = results
    .filter(r => r.docketNumber === docketNumber)
    .map(r => ({ r, score: scoreResult(r) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)

  if (candidates.length) return candidates[0].r

  // Fallback: any 2025+ result
  const any2025 = results.find(r => r.dateFiled >= '2025-01-01')
  if (any2025) return any2025

  // Last resort: first result
  return results[0]
}

// ── Normalise search-API fields to match what the app expects ─────────────────
function normalise(r, docketNumber) {
  return {
    // Identification
    docketNumber:      r.docketNumber ?? docketNumber,
    docket_id:         r.docket_id,
    docket_absolute_url: r.docket_absolute_url,
    pacer_case_id:     r.pacer_case_id,

    // Core case info
    case_name:         r.caseName,
    court_id:          r.court_id,
    court_citation:    r.court_citation_string,   // e.g. "N.D.N.Y."
    court_full:        r.court,                   // e.g. "District Court, N.D. New York"

    // Dates
    date_filed:        r.dateFiled,
    date_terminated:   r.dateTerminated,

    // Classification
    nature_of_suit:    r.suitNature,
    cause:             r.cause,
    jury_demand:       r.juryDemand,
    jurisdiction_type: r.jurisdictionType,

    // Judges
    assigned_to_str:   r.assignedTo,
    referred_to_str:   r.referredTo,

    // Parties
    parties:           r.party ?? [],

    // Internal
    fetched_at: Date.now(),
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useOneDocket(docketNumber) {
  // Pre-baked static data takes priority — no API call needed
  const preloaded = docketNumber ? (CL_CASES_DATA[docketNumber] ?? null) : null

  // Seed from static data or localStorage cache immediately (no flash on repeat visits)
  const [data, setData] = useState(() => {
    if (preloaded) return preloaded
    if (!docketNumber) return null
    try {
      const cache = loadClCache()
      const entry = cache[docketNumber]
      if (entry && !entry._notFound && Date.now() - entry.fetched_at < CL_CACHE_TTL_MS) {
        return entry
      }
    } catch {}
    return null
  })

  const [loading, setLoading] = useState(!data)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    // Static data available — no fetch needed
    if (preloaded) return

    if (!docketNumber) return

    // Already have fresh cached data → nothing to do
    const cache = loadClCache()
    const entry = cache[docketNumber]
    if (entry && !entry._notFound && Date.now() - entry.fetched_at < CL_CACHE_TTL_MS) {
      setData(entry)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    searchCL(docketNumber)
      .then(results => {
        if (cancelled) return
        const best = pickBestResult(results, docketNumber)
        if (best) {
          const normalised = normalise(best, docketNumber)
          const fresh = loadClCache()
          fresh[docketNumber] = normalised
          saveClCache(fresh)
          setData(normalised)
        } else {
          const tombstone = { _notFound: true, fetched_at: Date.now() }
          const fresh = loadClCache()
          fresh[docketNumber] = tombstone
          saveClCache(fresh)
          setError('No matching case found in CourtListener for this docket number.')
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [docketNumber])

  return { data, loading, error }
}
