// ─────────────────────────────────────────────────────────────────────────────
//  COURTLISTENER API CONFIGURATION
//
//  API docs: https://www.courtlistener.com/help/api/rest/
//  Dockets:  GET /api/rest/v4/dockets/?docket_number={number}
//
//  NOTE: This token is included in client-side code. It is visible in the
//  browser's network requests. CourtListener rate-limits per token,
//  so treat it as semi-public. Rotate it if abused.
// ─────────────────────────────────────────────────────────────────────────────

export const CL_TOKEN         = 'f744dca1998ea4d54bd963f4a736c7072112d517'
export const CL_BASE          = 'https://www.courtlistener.com/api/rest/v4'
export const CL_CACHE_KEY     = 'cl_docket_cache_v1'
export const CL_CACHE_TTL_MS  = 24 * 60 * 60 * 1000   // 24 hours per docket
export const CL_MAX_QUERIES   = 1000                   // hard cap per session
export const CL_CONCURRENT    = 5                      // requests in flight at once
export const CL_BATCH_DELAY   = 500                    // ms between batches → ~10 req/sec

// ── Court ID → display abbreviation ──────────────────────────────────────────
export const COURT_DISPLAY = {
  // Special
  scotus: 'SCOTUS',  dcd: 'D.D.C.',  cadc: 'D.C. Cir.',
  // Circuit courts
  ca1: '1st Cir.', ca2: '2nd Cir.', ca3: '3rd Cir.', ca4: '4th Cir.',
  ca5: '5th Cir.', ca6: '6th Cir.', ca7: '7th Cir.', ca8: '8th Cir.',
  ca9: '9th Cir.', ca10: '10th Cir.', ca11: '11th Cir.', cafc: 'Fed. Cir.',
  // Specialty
  cit: "Ct. Int'l Trade", uscfc: 'Fed. Claims',
  // 1st Circuit districts
  mab: 'D. Mass.', mad: 'D. Mass.', me: 'D. Me.', nh: 'D.N.H.', ri: 'D.R.I.', prd: 'D.P.R.',
  // 2nd Circuit
  ctd: 'D. Conn.', nyed: 'E.D.N.Y.', nynd: 'N.D.N.Y.', nysd: 'S.D.N.Y.', nywd: 'W.D.N.Y.', vtd: 'D. Vt.',
  // 3rd Circuit
  ded: 'D. Del.', njd: 'D.N.J.', paed: 'E.D. Pa.', pamd: 'M.D. Pa.', pawd: 'W.D. Pa.', vid: 'D.V.I.',
  // 4th Circuit
  mdd: 'D. Md.', nced: 'E.D.N.C.', ncmd: 'M.D.N.C.', ncwd: 'W.D.N.C.',
  scd: 'D.S.C.', vaed: 'E.D. Va.', vawd: 'W.D. Va.', wvnd: 'N.D.W. Va.', wvsd: 'S.D.W. Va.',
  // 5th Circuit
  laed: 'E.D. La.', lamd: 'M.D. La.', lawd: 'W.D. La.',
  msnd: 'N.D. Miss.', mssd: 'S.D. Miss.',
  txed: 'E.D. Tex.', txnd: 'N.D. Tex.', txsd: 'S.D. Tex.', txwd: 'W.D. Tex.',
  // 6th Circuit
  kyed: 'E.D. Ky.', kywd: 'W.D. Ky.', mied: 'E.D. Mich.', miwd: 'W.D. Mich.',
  ohnd: 'N.D. Ohio', ohsd: 'S.D. Ohio', tned: 'E.D. Tenn.', tnmd: 'M.D. Tenn.', tnwd: 'W.D. Tenn.',
  // 7th Circuit
  ilcd: 'C.D. Ill.', ilnd: 'N.D. Ill.', ilsd: 'S.D. Ill.',
  innd: 'N.D. Ind.', insd: 'S.D. Ind.', wied: 'E.D. Wis.', wiwd: 'W.D. Wis.',
  // 8th Circuit
  ared: 'E.D. Ark.', arwd: 'W.D. Ark.', iand: 'N.D. Iowa', iasd: 'S.D. Iowa',
  mnd: 'D. Minn.', moed: 'E.D. Mo.', mowd: 'W.D. Mo.',
  ned: 'D. Neb.', ndd: 'D.N.D.', sdd: 'D.S.D.',
  // 9th Circuit
  akd: 'D. Alaska', azd: 'D. Ariz.', cacd: 'C.D. Cal.', caed: 'E.D. Cal.',
  cand: 'N.D. Cal.', casd: 'S.D. Cal.', gud: 'D. Guam', hid: 'D. Haw.',
  idd: 'D. Idaho', mtd: 'D. Mont.', nvd: 'D. Nev.', ord: 'D. Or.',
  waed: 'E.D. Wash.', wawd: 'W.D. Wash.',
  // 10th Circuit
  cod: 'D. Colo.', ksd: 'D. Kan.', nmd: 'D.N.M.',
  oknd: 'N.D. Okla.', oked: 'E.D. Okla.', okwd: 'W.D. Okla.',
  utd: 'D. Utah', wyd: 'D. Wyo.',
  // 11th Circuit
  almd: 'M.D. Ala.', alnd: 'N.D. Ala.', alsd: 'S.D. Ala.',
  flmd: 'M.D. Fla.', flnd: 'N.D. Fla.', flsd: 'S.D. Fla.',
  gamd: 'M.D. Ga.', gand: 'N.D. Ga.', gasd: 'S.D. Ga.',
}

export function courtName(courtId) {
  return COURT_DISPLAY[courtId] || courtId?.toUpperCase() || '—'
}

// ── Cache helpers ─────────────────────────────────────────────────────────────
export function loadClCache() {
  try { return JSON.parse(localStorage.getItem(CL_CACHE_KEY) || '{}') } catch { return {} }
}

export function saveClCache(cache) {
  try {
    localStorage.setItem(CL_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage full — prune oldest 20% and retry
    try {
      const entries = Object.entries(cache).sort((a, b) => a[1].fetched_at - b[1].fetched_at)
      const pruned = Object.fromEntries(entries.slice(Math.floor(entries.length * 0.2)))
      localStorage.setItem(CL_CACHE_KEY, JSON.stringify(pruned))
    } catch {}
  }
}
