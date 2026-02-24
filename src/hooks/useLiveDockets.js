import { useState, useEffect, useCallback } from 'react'
import { sheetCsvUrl, POLL_INTERVAL_MS } from '../data/sheetsConfig'

// ── CSV parser ────────────────────────────────────────────────────────────────
// The sheet has (at least) a "Docket Number" column.
// Handles: quoted fields, blank rows, header row, Windows line endings.
function parseDocketCsv(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  const dockets = []

  for (const line of lines) {
    // Strip surrounding quotes that gviz/tq adds around field values
    const raw = line.trim().replace(/^"(.*)"$/, '$1').trim()
    if (!raw) continue

    // Skip header row — any row whose value looks like a column name
    const lower = raw.toLowerCase()
    if (
      lower === 'docket number' ||
      lower === 'docket_number' ||
      lower === 'docketnumber' ||
      lower === 'docket' ||
      lower === 'case number' ||
      lower === 'number'
    ) continue

    dockets.push(raw)
  }

  return dockets
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLiveDockets() {
  const [dockets, setDockets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [lastUpdated, setLastUpdated]   = useState(null)
  const [syncing, setSyncing]           = useState(false)  // true on background refresh

  const fetchDockets = useCallback(async (isBackground = false) => {
    if (isBackground) setSyncing(true)
    try {
      const res = await fetch(sheetCsvUrl())
      if (!res.ok) throw new Error(`Sheet returned HTTP ${res.status}`)
      const text = await res.text()
      const parsed = parseDocketCsv(text)
      setDockets(parsed)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchDockets(false)
  }, [fetchDockets])

  // Polling — re-fetch on interval to pick up additions / deletions
  useEffect(() => {
    const id = setInterval(() => fetchDockets(true), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchDockets])

  return {
    dockets,      // string[]  — raw docket numbers from sheet
    loading,      // boolean   — true only on first load
    syncing,      // boolean   — true on background refresh (not first load)
    error,        // string | null
    lastUpdated,  // Date | null
    refresh: () => fetchDockets(false),
  }
}
