import { useState, useEffect, useRef } from 'react'
import { useLiveDockets } from './useLiveDockets'
import {
  CL_TOKEN, CL_BASE, CL_CACHE_TTL_MS, CL_MAX_QUERIES,
  CL_CONCURRENT, CL_BATCH_DELAY,
  loadClCache, saveClCache,
} from '../data/courtlistenerConfig'

// ── Uses the fast /search/ endpoint (Solr-backed, < 1s) instead of the slow
//    /dockets/?docket_number= endpoint which does a full DB scan.

const GOV_KEYWORDS = [
  'trump', 'dhs', 'doj', 'doge', 'opm', 'fbi', 'cia', 'ice', 'cbp',
  'state department', 'department of', 'secretary', 'attorney general',
  'noem', 'rubio', 'hegseth', 'bondi', 'vought', 'musk',
  'united states', 'u.s.', 'federal', 'president', 'administration',
  'executive', 'agency', 'bureau', 'office of',
]

function scoreResult(r) {
  const text = [r.caseName ?? '', ...(r.party ?? [])].join(' ').toLowerCase()
  if (!r.dateFiled || r.dateFiled < '2025-01-01') return -1
  let score = 0
  for (const kw of GOV_KEYWORDS) { if (text.includes(kw)) score++ }
  return score
}

function pickBestResult(results, docketNumber) {
  if (!results.length) return null
  const candidates = results
    .filter(r => r.docketNumber === docketNumber)
    .map(r => ({ r, score: scoreResult(r) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
  if (candidates.length) return candidates[0].r
  const any2025 = results.find(r => r.dateFiled >= '2025-01-01')
  return any2025 ?? results[0]
}

function normalise(r, docketNumber) {
  return {
    docketNumber:        r.docketNumber ?? docketNumber,
    docket_id:           r.docket_id,
    docket_absolute_url: r.docket_absolute_url,
    pacer_case_id:       r.pacer_case_id,
    case_name:           r.caseName,
    court_id:            r.court_id,
    court_citation:      r.court_citation_string,
    court_full:          r.court,
    date_filed:          r.dateFiled,
    date_terminated:     r.dateTerminated,
    nature_of_suit:      r.suitNature,
    cause:               r.cause,
    jury_demand:         r.juryDemand,
    jurisdiction_type:   r.jurisdictionType,
    assigned_to_str:     r.assignedTo,
    referred_to_str:     r.referredTo,
    parties:             r.party ?? [],
    fetched_at:          Date.now(),
  }
}

async function fetchDocketFromCL(docketNumber) {
  const q   = `"${docketNumber}"`
  const url = `${CL_BASE}/search/?q=${encodeURIComponent(q)}&type=d&format=json`
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${CL_TOKEN}`,
      Accept: 'application/json',
    },
  })
  if (res.status === 429) throw new Error('RATE_LIMITED')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const best = pickBestResult(data.results ?? [], docketNumber)
  return best ? normalise(best, docketNumber) : null
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useEnrichedDockets() {
  const {
    dockets,
    loading: sheetLoading,
    syncing,
    error: sheetError,
    lastUpdated,
    refresh,
  } = useLiveDockets()

  // Seed enriched state immediately from valid cache entries
  const [enriched, setEnriched] = useState(() => {
    const cache = loadClCache()
    const now   = Date.now()
    const valid = {}
    for (const [k, v] of Object.entries(cache)) {
      if (!v._notFound && now - v.fetched_at < CL_CACHE_TTL_MS) valid[k] = v
    }
    return valid
  })

  const [progress, setProgress] = useState({ fetched: 0, total: 0, done: true })

  const sessionQueries = useRef(0)
  const activeRun      = useRef(null)

  useEffect(() => {
    if (sheetLoading || dockets.length === 0) return

    const cache = loadClCache()
    const now   = Date.now()

    const toFetch = dockets.filter(d => {
      const entry = cache[d]
      return !entry || now - entry.fetched_at >= CL_CACHE_TTL_MS
    })

    const remaining = CL_MAX_QUERIES - sessionQueries.current
    const limited   = toFetch.slice(0, Math.max(0, remaining))

    if (limited.length === 0) {
      setProgress({ fetched: 0, total: 0, done: true })
      return
    }

    if (activeRun.current) activeRun.current.cancelled = true
    const ctrl = { cancelled: false }
    activeRun.current = ctrl

    setProgress({ fetched: 0, total: limited.length, done: false })

    async function run() {
      let fetched    = 0
      const localCache = { ...loadClCache() }

      for (let i = 0; i < limited.length; i += CL_CONCURRENT) {
        if (ctrl.cancelled) break
        if (sessionQueries.current >= CL_MAX_QUERIES) break

        const batch   = limited.slice(i, i + CL_CONCURRENT)
        const results = await Promise.allSettled(batch.map(d => fetchDocketFromCL(d)))

        if (ctrl.cancelled) break

        const updates = {}

        results.forEach((result, idx) => {
          const docketNum = batch[idx]
          sessionQueries.current++

          if (result.status === 'fulfilled' && result.value) {
            localCache[docketNum] = result.value
            updates[docketNum]    = result.value
          } else {
            localCache[docketNum] = { _notFound: true, fetched_at: Date.now() }
          }
          fetched++
        })

        setEnriched(prev => ({ ...prev, ...updates }))
        setProgress({ fetched, total: limited.length, done: false })
        saveClCache(localCache)

        if (i + CL_CONCURRENT < limited.length && !ctrl.cancelled) {
          await new Promise(r => setTimeout(r, CL_BATCH_DELAY))
        }
      }

      if (!ctrl.cancelled) {
        setProgress(p => ({ ...p, done: true }))
      }
    }

    run()
  }, [dockets, sheetLoading])

  return {
    enriched,
    progress,
    dockets,
    sheetLoading,
    sheetError,
    syncing,
    lastUpdated,
    refresh,
  }
}
