// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE SHEETS LIVE DATA CONFIGURATION
//
//  The spreadsheet at SHEET_ID is the source of truth for tracked case dockets.
//  It must be shared with "Anyone with the link → Viewer" access (already set).
//
//  Required sheet column: "Docket Number"
//    Format examples: 1:25-cv-01683  |  25-1215  |  0:26-cv-00190
//
//  To add a case:  paste its docket number into the sheet → website updates automatically
//  To remove:      delete its row → website removes it on next refresh
//
//  Live sync interval: every 5 minutes while the page is open
// ─────────────────────────────────────────────────────────────────────────────

export const SHEET_ID = '1tcE8yJ6TZxGklxOAAPOvaNrwbWG_CmpSgVC9hIf9Xi0'

// How often to re-fetch the sheet (milliseconds)
export const POLL_INTERVAL_MS = 5 * 60 * 1000   // 5 minutes

// Returns the CSV export URL for the first sheet tab
export function sheetCsvUrl() {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
}

// Deep-link to CourtListener docket search for a given docket number
export function courtListenerUrl(docketNumber) {
  return `https://www.courtlistener.com/?q=%22${encodeURIComponent(docketNumber)}%22&type=d`
}

// Deep-link to a PACER docket search (requires court abbreviation which we derive below)
export function pacerSearchUrl(docketNumber) {
  return `https://pcl.uscourts.gov/pcl/pages/search/results/dockets.jsf?docketNumber=${encodeURIComponent(docketNumber)}`
}

// ── Docket number helpers ─────────────────────────────────────────────────────

// Parse a docket number into its components.
// District format:  1:25-cv-01683  → { division: '1', year: '25', type: 'cv', number: '01683', level: 'district' }
// Appellate format: 25-1215        → { year: '25', number: '1215', level: 'appellate' }
export function parseDocket(raw) {
  const s = raw.trim()

  // District / divisional: X:YY-type-NNNNN
  const districtMatch = s.match(/^(\d+):(\d{2})-([a-z]+)-(\d+)/i)
  if (districtMatch) {
    return {
      raw: s,
      division: districtMatch[1],
      year: `20${districtMatch[2]}`,
      type: districtMatch[3].toLowerCase(),
      number: districtMatch[4],
      level: 'district',
    }
  }

  // Appellate / circuit: YY-NNNN or YY-NNNNN
  const appellateMatch = s.match(/^(\d{2})-(\d{3,5})$/)
  if (appellateMatch) {
    return {
      raw: s,
      year: `20${appellateMatch[1]}`,
      number: appellateMatch[2],
      level: 'appellate',
    }
  }

  return { raw: s, level: 'unknown' }
}

export function docketTypeLabel(parsed) {
  if (parsed.level === 'appellate') return 'Circuit Court'
  if (parsed.level === 'district') {
    if (parsed.type === 'cv') return 'Civil'
    if (parsed.type === 'cr') return 'Criminal'
    return parsed.type?.toUpperCase() ?? 'Federal'
  }
  return 'Federal'
}
