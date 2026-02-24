#!/usr/bin/env node
/**
 * fetchAllCases.mjs
 * Fetches every docket number from the Google Sheet, queries CourtListener for
 * case metadata, and writes src/data/clCases.js — a static dataset usable by
 * the React app without further API calls.
 *
 * Run: node scripts/fetchAllCases.mjs
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────
const SHEET_ID    = '1tcE8yJ6TZxGklxOAAPOvaNrwbWG_CmpSgVC9hIf9Xi0'
const CL_TOKEN    = 'f744dca1998ea4d54bd963f4a736c7072112d517'
const CL_BASE     = 'https://www.courtlistener.com/api/rest/v4'
const CONCURRENT  = 5
const BATCH_DELAY = 600   // ms between batches → safe rate

const FIELDS = [
  'court', 'court_id', 'date_filed', 'date_terminated',
  'case_name', 'docket_number', 'cause', 'nature_of_suit',
  'jury_demand', 'jurisdiction_type', 'date_blocked', 'blocked',
  'pacer_case_id',
].join(',')

// ── Court display map ─────────────────────────────────────────────────────────
const COURT_DISPLAY = {
  scotus:'SCOTUS', dcd:'D.D.C.', cadc:'D.C. Cir.',
  ca1:'1st Cir.', ca2:'2nd Cir.', ca3:'3rd Cir.', ca4:'4th Cir.',
  ca5:'5th Cir.', ca6:'6th Cir.', ca7:'7th Cir.', ca8:'8th Cir.',
  ca9:'9th Cir.', ca10:'10th Cir.', ca11:'11th Cir.', cafc:'Fed. Cir.',
  cit:"Ct. Int'l Trade", uscfc:'Fed. Claims',
  mab:'D. Mass.', mad:'D. Mass.', me:'D. Me.', nh:'D.N.H.', ri:'D.R.I.', prd:'D.P.R.',
  ctd:'D. Conn.', nyed:'E.D.N.Y.', nynd:'N.D.N.Y.', nysd:'S.D.N.Y.', nywd:'W.D.N.Y.', vtd:'D. Vt.',
  ded:'D. Del.', njd:'D.N.J.', paed:'E.D. Pa.', pamd:'M.D. Pa.', pawd:'W.D. Pa.', vid:'D.V.I.',
  mdd:'D. Md.', nced:'E.D.N.C.', ncmd:'M.D.N.C.', ncwd:'W.D.N.C.',
  scd:'D.S.C.', vaed:'E.D. Va.', vawd:'W.D. Va.', wvnd:'N.D.W. Va.', wvsd:'S.D.W. Va.',
  laed:'E.D. La.', lamd:'M.D. La.', lawd:'W.D. La.',
  msnd:'N.D. Miss.', mssd:'S.D. Miss.',
  txed:'E.D. Tex.', txnd:'N.D. Tex.', txsd:'S.D. Tex.', txwd:'W.D. Tex.',
  kyed:'E.D. Ky.', kywd:'W.D. Ky.', mied:'E.D. Mich.', miwd:'W.D. Mich.',
  ohnd:'N.D. Ohio', ohsd:'S.D. Ohio', tned:'E.D. Tenn.', tnmd:'M.D. Tenn.', tnwd:'W.D. Tenn.',
  ilcd:'C.D. Ill.', ilnd:'N.D. Ill.', ilsd:'S.D. Ill.',
  innd:'N.D. Ind.', insd:'S.D. Ind.', wied:'E.D. Wis.', wiwd:'W.D. Wis.',
  ared:'E.D. Ark.', arwd:'W.D. Ark.', iand:'N.D. Iowa', iasd:'S.D. Iowa',
  mnd:'D. Minn.', moed:'E.D. Mo.', mowd:'W.D. Mo.',
  ned:'D. Neb.', ndd:'D.N.D.', sdd:'D.S.D.',
  akd:'D. Alaska', azd:'D. Ariz.', cacd:'C.D. Cal.', caed:'E.D. Cal.',
  cand:'N.D. Cal.', casd:'S.D. Cal.', gud:'D. Guam', hid:'D. Haw.',
  idd:'D. Idaho', mtd:'D. Mont.', nvd:'D. Nev.', ord:'D. Or.',
  waed:'E.D. Wash.', wawd:'W.D. Wash.',
  cod:'D. Colo.', ksd:'D. Kan.', nmd:'D.N.M.',
  oknd:'N.D. Okla.', oked:'E.D. Okla.', okwd:'W.D. Okla.',
  utd:'D. Utah', wyd:'D. Wyo.',
  almd:'M.D. Ala.', alnd:'N.D. Ala.', alsd:'S.D. Ala.',
  flmd:'M.D. Fla.', flnd:'N.D. Fla.', flsd:'S.D. Fla.',
  gamd:'M.D. Ga.', gand:'N.D. Ga.', gasd:'S.D. Ga.',
}

function courtName(id) { return COURT_DISPLAY[id] || id?.toUpperCase() || '—' }

// ── Step 1: fetch docket numbers from sheet ───────────────────────────────────
async function fetchDockets() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
  console.log('Fetching Google Sheet…')
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`Sheet HTTP ${res.status}`)
  const text = await res.text()

  const dockets = []
  for (const line of text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')) {
    const raw = line.trim().replace(/^"(.*)"$/, '$1').trim()
    if (!raw) continue
    const lower = raw.toLowerCase()
    if (['docket number','docket_number','docketnumber','docket','case number','number'].includes(lower)) continue
    dockets.push(raw)
  }
  console.log(`  → ${dockets.length} docket numbers loaded`)
  return dockets
}

// ── Step 2: fetch one docket from CourtListener ───────────────────────────────
async function fetchFromCL(docketNumber) {
  const url = `${CL_BASE}/dockets/?docket_number=${encodeURIComponent(docketNumber)}&fields=${FIELDS}`
  const res = await fetch(url, { headers: { Authorization: `Token ${CL_TOKEN}` } })
  if (res.status === 429) throw new Error('RATE_LIMITED')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.results?.[0] ?? null
}

// ── Step 3: infer case status from API fields ─────────────────────────────────
function inferStatus(clData) {
  if (!clData) return 'active'
  if (clData.date_terminated) return 'closed-unknown'   // can't tell for/against without ruling text
  return 'active'
}

// ── Step 4: infer issue slug from nature_of_suit / cause ─────────────────────
const ISSUE_PATTERNS = [
  { slug: 'immigration',      patterns: ['immig', 'asylum', 'border', 'alien', 'citizenship', 'deport', 'removal', 'visa', 'refugee', '460', '461', '462', '463', '465'] },
  { slug: 'civil-rights',     patterns: ['civil rights', 'equal protection', 'first amend', 'free speech', 'voting', 'discrimination', '440', '441', '442', '443', '444', '445', '446', '448', '449'] },
  { slug: 'executive-power',  patterns: ['doge', 'opm', 'separat', 'executive', 'agency', 'admin', 'federal employ', 'government employ', 'merit system', '890', '895'] },
  { slug: 'environment',      patterns: ['environment', 'epa', 'clean air', 'clean water', 'endangered', 'climate', 'pollution', 'nepa', '893'] },
  { slug: 'healthcare',       patterns: ['health', 'medicare', 'medicaid', 'aca', 'affordable care', 'hhs', 'fda', '443'] },
  { slug: 'education',        patterns: ['education', 'school', 'university', 'title ix', 'dei', 'affirmative action', 'student', '448'] },
  { slug: 'foreign-policy',   patterns: ['foreign', 'sanction', 'tariff', 'trade', 'treaty', 'nato', 'aid', '890'] },
  { slug: 'free-speech',      patterns: ['first amend', 'speech', 'press', 'religion', 'establishment', 'free exercise', '440'] },
]

function inferIssueSlug(clData) {
  if (!clData) return 'executive-power'
  const haystack = [
    clData.nature_of_suit ?? '',
    clData.cause ?? '',
    clData.case_name ?? '',
  ].join(' ').toLowerCase()

  for (const { slug, patterns } of ISSUE_PATTERNS) {
    if (patterns.some(p => haystack.includes(p))) return slug
  }
  return 'executive-power'    // default bucket
}

// ── Step 5: build a safe ID from docket number ───────────────────────────────
function makeId(docketNumber) {
  return 'cl-' + docketNumber.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ── Step 6: build a minimal description ──────────────────────────────────────
function buildDescription(clData, docketNumber) {
  if (!clData) return `Federal case ${docketNumber}.`
  const parts = []
  if (clData.nature_of_suit) parts.push(`Nature of suit: ${clData.nature_of_suit}.`)
  if (clData.cause)          parts.push(`Cause of action: ${clData.cause}.`)
  if (!parts.length)         parts.push(`Federal civil case filed in ${courtName(clData.court_id)}.`)
  return parts.join(' ')
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dockets   = await fetchDockets()
  const results   = []
  const notFound  = []
  const errors    = []

  const total = dockets.length
  let fetched = 0

  console.log(`\nFetching CourtListener data for ${total} dockets (5 concurrent, ~${Math.ceil(total/5)*0.6}s)…\n`)

  for (let i = 0; i < total; i += CONCURRENT) {
    const batch = dockets.slice(i, i + CONCURRENT)

    const settled = await Promise.allSettled(batch.map(d => fetchFromCL(d)))

    settled.forEach((result, idx) => {
      const docketNumber = batch[idx]
      fetched++

      if (result.status === 'fulfilled') {
        const clData = result.value
        if (clData) {
          results.push({
            id:           makeId(docketNumber),
            docketNumber,
            clId:         clData.id ?? null,
            name:         clData.case_name ?? docketNumber,
            status:       inferStatus(clData),
            court:        courtName(clData.court_id),
            courtId:      clData.court_id ?? null,
            dateFiled:    clData.date_filed ?? null,
            dateTerminated: clData.date_terminated ?? null,
            causeOfAction:  clData.cause ?? null,
            natureOfSuit:   clData.nature_of_suit ?? null,
            juryDemand:     clData.jury_demand ?? null,
            jurisdictionType: clData.jurisdiction_type ?? null,
            blocked:        clData.blocked ?? false,
            dateBlocked:    clData.date_blocked ?? null,
            issueSlug:    inferIssueSlug(clData),
            description:  buildDescription(clData, docketNumber),
            // These require human input — left empty for now:
            courts:   [],
            timeline: [],
          })
        } else {
          notFound.push(docketNumber)
        }
      } else {
        errors.push({ docketNumber, error: result.reason?.message })
        if (result.reason?.message === 'RATE_LIMITED') {
          console.error('  !! RATE LIMITED — waiting 5s…')
        }
      }
    })

    process.stdout.write(`  [${fetched}/${total}] batch ${Math.ceil(fetched/CONCURRENT)}/${Math.ceil(total/CONCURRENT)}\r`)

    if (i + CONCURRENT < total) {
      await new Promise(r => setTimeout(r, BATCH_DELAY))
    }
  }

  console.log(`\n\n✓ Found:     ${results.length}`)
  console.log(`  Not found: ${notFound.length}`)
  console.log(`  Errors:    ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n  Error details:')
    errors.slice(0, 10).forEach(e => console.log(`    ${e.docketNumber}: ${e.error}`))
  }

  // ── Write output file ────────────────────────────────────────────────────────
  const outputPath = join(__dirname, '../src/data/clCases.js')

  const fileContent = `// AUTO-GENERATED by scripts/fetchAllCases.mjs — do not edit by hand
// Re-run: node scripts/fetchAllCases.mjs
// Generated: ${new Date().toISOString()}
// Source: ${results.length} cases matched from ${total} docket numbers

// status values: 'active' | 'injunction' | 'closed-for' | 'closed-against' | 'closed-unknown'
// Fields requiring human review (per case): status, issueSlug, description, courts[], timeline[]

export const CL_CASES = ${JSON.stringify(results, null, 2)}

export const CL_CASES_BY_ID = Object.fromEntries(CL_CASES.map(c => [c.id, c]))
export const CL_CASES_BY_DOCKET = Object.fromEntries(CL_CASES.map(c => [c.docketNumber, c]))

// Summary stats for the dataset
export const CL_STATS = {
  total:        ${results.length},
  active:       ${results.filter(r => r.status === 'active').length},
  terminated:   ${results.filter(r => r.dateTerminated).length},
  notFound:     ${notFound.length},
  errors:       ${errors.length},
  generatedAt:  '${new Date().toISOString()}',
}

// Dockets that had no CourtListener match
export const CL_NOT_FOUND = ${JSON.stringify(notFound)}
`

  writeFileSync(outputPath, fileContent, 'utf8')
  console.log(`\n✓ Written to ${outputPath}`)

  // ── Write not-found log ───────────────────────────────────────────────────────
  if (notFound.length > 0) {
    const logPath = join(__dirname, '../scripts/notFound.txt')
    writeFileSync(logPath, notFound.join('\n') + '\n', 'utf8')
    console.log(`  Not-found dockets written to scripts/notFound.txt`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
