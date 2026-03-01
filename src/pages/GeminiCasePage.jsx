import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JudgeLink from '../components/JudgeLink'
import { AnnotatedText, LegalTooltip } from '../components/LegalTooltip'
import { GEMINI_CASE as _GEMINI_CASE_TEST, GENERATED_AT as _GENERATED_AT_TEST } from '../data/geminiCaseData'
import {
  CASE_STATUS_LABEL as _CASE_STATUS_LABEL_TEST,
  OVERALL_FAVORABILITY as _OVERALL_FAVORABILITY_TEST,
  LAWS_AT_ISSUE as _LAWS_AT_ISSUE_TEST,
  DEFENDANT_GROUPS as _DEFENDANT_GROUPS_TEST,
  JUDICIAL_INFO as _JUDICIAL_INFO_TEST,
  EXECUTIVE_STATUS as _EXECUTIVE_STATUS_TEST,
  ACTION_CLASSIFICATIONS as _ACTION_CLASSIFICATIONS_TEST,
  ACTION_ENRICHMENTS as _ACTION_ENRICHMENTS_TEST,
  TIMELINE_DOCS as _TIMELINE_DOCS_TEST,
  TOKEN_USAGE as _TOKEN_USAGE_TEST,
  GEMINI_PRICING as _GEMINI_PRICING_TEST,
  PACER_USAGE as _PACER_USAGE_TEST,
} from '../data/geminiCaseEnrichments'
import { CASES_REGISTRY } from '../data/casesRegistry'
import { LEGAL_TERMS } from '../data/legalTerms'
import './CasePage.css'
import './GeminiCasePage.css'

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, handler])
}

function ShareWidget({ caseData }) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)
  useOutsideClick(ref, useCallback(() => setOpen(false), []))

  const url   = window.location.href
  const title = `${caseData.name} | Legal Challenges Tracker`
  const text  = `Track this case: ${caseData.name} — ${caseData.court}`

  function handleNativeShare() {
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {})
    } else {
      setOpen(o => !o)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const emailHref   = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  const smsHref     = `sms:?body=${encodeURIComponent(`${text}\n${url}`)}`
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

  return (
    <div className="share-wrap" ref={ref}>
      <button
        className={`share-btn ${open ? 'share-btn--open' : ''}`}
        onClick={handleNativeShare}
        aria-label="Share this case"
      >
        <svg viewBox="0 0 18 18" fill="none" className="share-btn-icon">
          <circle cx="14" cy="4"  r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="4"  cy="9"  r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6.3 7.8L11.7 5.2M6.3 10.2L11.7 12.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Share
      </button>

      {open && (
        <div className="share-popover">
          <div className="share-popover-title">Share this case</div>

          <button className="share-option" onClick={copyLink}>
            {copied ? (
              <svg viewBox="0 0 16 16" fill="none" className="share-option-icon share-option-icon--check">
                <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
                <rect x="5" y="2" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 5H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            )}
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>

          <a className="share-option" href={emailHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 5.5l6.3 4.5a1 1 0 001.4 0L15 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>Email</span>
          </a>

          <a className="share-option" href={smsHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
              <rect x="1" y="1" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 13l2-2h5a2 2 0 002-2V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 6h6M5 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>Text / SMS</span>
          </a>

          <a className="share-option" href={twitterHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
              <path d="M12.6 2h2.4l-5.2 5.9L16 14h-4.8L7.6 9.9 3.4 14H1l5.6-6.3L0 2h4.9l3.5 4.6L12.6 2z" fill="currentColor"/>
            </svg>
            <span>Post on X</span>
          </a>
        </div>
      )}
    </div>
  )
}

const TYPE_CONFIG = {
  'admin-action':   { label: 'Admin Action', color: '#e63946' },
  'filed':          { label: 'Filed',        color: '#457b9d' },
  'hearing':        { label: 'Hearing',      color: 'rgba(255,255,255,0.35)' },
  'tro':            { label: 'TRO',          color: '#f4a261' },
  'injunction':     { label: 'Injunction',   color: '#f4a261' },
  'ruling-for':     { label: 'Ruling For',   color: '#2a9d8f' },
  'ruling-against': { label: 'Ruling Against', color: '#e63946' },
  'appeal':         { label: 'Appeal',       color: '#c77dff' },
  'dismissed':      { label: 'Dismissed',    color: 'rgba(255,255,255,0.35)' },
}

// Map type → legal term key for badge tooltips
const TYPE_TERM_KEY = {
  tro: 'tro',
  injunction: 'injunction',
}

const COURT_LEVEL_MAP = {
  'District Court':  'district',
  'Court of Appeals': 'appeals',
  'Supreme Court':   'supreme',
}

const COURT_STATUS_LABEL = {
  active:      'Active',
  completed:   'Completed',
  anticipated: 'Anticipated',
}

const TIER_TYPES = ['District Court', 'Court of Appeals', 'Supreme Court']

// ── Cost helpers ─────────────────────────────────────────────────
function calcGeminiCosts(calls, tier, pricing) {
  const key = tier === '>200k' ? 'gt200k' : 'lte200k'
  return calls.map(c => ({
    ...c,
    inputCost:  (c.inputTokens  / 1_000_000) * pricing.input[key],
    outputCost: (c.outputTokens / 1_000_000) * pricing.output[key],
    get total() { return this.inputCost + this.outputCost },
  }))
}

function fmtDollar(n) {
  if (n < 0.0001) return '<$0.0001'
  return `$${n.toFixed(4)}`
}

function fmtTokens(n) { return n.toLocaleString() }
function fmtPct(n, cap) { return ((n / cap) * 100).toFixed(3) + '%' }

// ── Defendant grouping helper ─────────────────────────────────────
function groupDefendants(defendants, defGroups) {
  const grouped = defGroups.map(g => ({ ...g, members: [] }))
  const ungrouped = []

  defendants.forEach(d => {
    const nameUpper = d.name.toUpperCase()
    const found = grouped.find(g =>
      g.nameFragments.some(frag => nameUpper.includes(frag.toUpperCase()))
    )
    if (found) found.members.push(d)
    else ungrouped.push(d)
  })

  return { grouped: grouped.filter(g => g.members.length > 0), ungrouped }
}

// ── Timeline badge with optional doc-hover ───────────────────────
function TypeBadge({ type, docUrl }) {
  const cfg = TYPE_CONFIG[type] || { label: type, color: 'rgba(255,255,255,0.3)' }
  const termKey = TYPE_TERM_KEY[type]
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  const badge = (
    <span
      ref={ref}
      className="timeline-type-badge"
      style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}12` }}
      onMouseEnter={() => docUrl && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cfg.label}
      {hovered && docUrl && (
        <span className="badge-doc-popup">
          <svg viewBox="0 0 12 12" fill="none" className="bdp-icon">
            <path d="M2 2h6l2 2v6H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M8 2v2h2M4 6h4M4 8h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="bdp-link">
            Open source document
          </a>
        </span>
      )}
    </span>
  )

  if (termKey && LEGAL_TERMS[termKey]) {
    return <LegalTooltip termKey={termKey}>{badge}</LegalTooltip>
  }
  return badge
}

// ── Courts tier track — nodes clickable by level ─────────────────
function CourtsTierTrack({ courts }) {
  const navigate = useNavigate()
  const tiers = TIER_TYPES
    .map(type => courts.filter(c => c.type === type))
    .filter(t => t.length > 0)

  return (
    <div className="courts-tiers">
      {tiers.map((tier, ti) => (
        <div key={ti} className="courts-tier-wrap">
          {tier.length > 1 && <div className="courts-tier-bracket" />}
          <div className="courts-tier-row">
            {tier.map((c, ci) => {
              const level = COURT_LEVEL_MAP[c.type]
              return (
                <button
                  key={ci}
                  className={`court-node court-node--${c.status} court-node--clickable`}
                  onClick={() => navigate(`/cases?level=${level}`)}
                  title={`Filter all cases at ${c.type} level`}
                >
                  <div className="court-node-name">{c.name}</div>
                  <div className="court-node-type">{c.type}</div>
                  <div className={`court-node-status court-status--${c.status}`}>
                    {COURT_STATUS_LABEL[c.status] ?? c.status}
                  </div>
                  <div className="court-node-filter-hint">Filter cases →</div>
                </button>
              )
            })}
          </div>
          {ti < tiers.length - 1 && (
            <div className="courts-tier-arrow">
              <svg viewBox="0 0 28 8" fill="none">
                <path d="M0 4h22M18 1l6 3-6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Handle M/D/YY format from Google Sheets (e.g. "1/24/26")
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ? `20${year}` : year
    return new Date(Number(fullYear), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Status badge derivation ───────────────────────────────────────
function deriveStatusInfo(label) {
  if (!label) return { text: 'Active', cls: 'badge-active' }
  const l = label.toLowerCase()
  if (l.includes('dismiss')) return { text: 'Dismissed', cls: 'badge-closed-against' }
  if (l.includes('decided for plaintiff') || l.includes('ruling for plaintiff')) return { text: 'Closed — For', cls: 'badge-closed-for' }
  if (l.includes('injunction') && !l.includes('denied') && !l.includes('appeal')) return { text: 'Injunction', cls: 'badge-injunction' }
  return { text: 'Active', cls: 'badge-active' }
}

// ── Sidebar section definitions ───────────────────────────────────
const SIDEBAR_DEFS = [
  { id: 'sec-parties',    label: 'Parties' },
  { id: 'sec-background', label: 'Case Background' },
  { id: 'sec-status',     label: 'Current Status' },
  { id: 'sec-laws',       label: 'Laws Challenged' },
  { id: 'sec-news',       label: 'In the News' },
  { id: 'sec-appeals',    label: 'Appeals Tracker' },
  { id: 'sec-timeline',   label: 'Key Moments' },
  { id: 'sec-actions',    label: 'Key Actions' },
]

// ── Main page ────────────────────────────────────────────────────
const PARTIES_PREVIEW = 3

export default function GeminiCasePage() {
  const navigate = useNavigate()
  const { caseId } = useParams()

  // Resolve data: prefer registry entry if caseId present, else fall back to test data
  const caseData = caseId ? CASES_REGISTRY[caseId] : null
  const GEMINI_CASE           = caseData?.GEMINI_CASE           ?? _GEMINI_CASE_TEST
  const GENERATED_AT          = caseData?.GENERATED_AT          ?? _GENERATED_AT_TEST
  const CASE_STATUS_LABEL     = caseData?.CASE_STATUS_LABEL     ?? _CASE_STATUS_LABEL_TEST
  const OVERALL_FAVORABILITY  = caseData?.OVERALL_FAVORABILITY  ?? _OVERALL_FAVORABILITY_TEST
  const LAWS_AT_ISSUE         = caseData?.LAWS_AT_ISSUE         ?? _LAWS_AT_ISSUE_TEST
  const DEFENDANT_GROUPS      = caseData?.DEFENDANT_GROUPS      ?? _DEFENDANT_GROUPS_TEST
  const JUDICIAL_INFO         = caseData?.JUDICIAL_INFO         ?? _JUDICIAL_INFO_TEST
  const EXECUTIVE_STATUS      = caseData?.EXECUTIVE_STATUS      ?? _EXECUTIVE_STATUS_TEST
  const ACTION_CLASSIFICATIONS = caseData?.ACTION_CLASSIFICATIONS ?? _ACTION_CLASSIFICATIONS_TEST
  const ACTION_ENRICHMENTS    = caseData?.ACTION_ENRICHMENTS    ?? _ACTION_ENRICHMENTS_TEST
  const TIMELINE_DOCS         = caseData?.TIMELINE_DOCS         ?? _TIMELINE_DOCS_TEST
  const TOKEN_USAGE           = caseData?.TOKEN_USAGE           ?? _TOKEN_USAGE_TEST
  const GEMINI_PRICING        = caseData?.GEMINI_PRICING        ?? _GEMINI_PRICING_TEST
  const PACER_USAGE           = caseData?.PACER_USAGE           ?? _PACER_USAGE_TEST

  const [showAll, setShowAll] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [costTier, setCostTier] = useState('<=200k')
  const [showAllParties, setShowAllParties] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [enrichLog, setEnrichLog] = useState([])
  const [enrichResult, setEnrichResult] = useState(null)
  const [enrichError, setEnrichError] = useState(null)
  const [activeSection, setActiveSection] = useState('')

  // Not found — caseId given but not in registry
  if (caseId && !caseData) {
    return (
      <div className="app">
        <NavBar />
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Case Not Found</h2>
          <p>No enriched data available for case <code>{caseId}</code>.</p>
          <p>Run <code>python src/gemini_enrich_cases.py --cases {caseId}</code> to generate it.</p>
        </div>
      </div>
    )
  }

  const c = GEMINI_CASE

  const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1tcE8yJ6TZxGklxOAAPOvaNrwbWG_CmpSgVC9hIf9Xi0/edit#gid=0'
  const LOCAL_API  = 'http://localhost:5174'

  async function runEnrichment() {
    setEnriching(true)
    setEnrichLog([])
    setEnrichResult(null)
    setEnrichError(null)

    try {
      const resp = await fetch(`${LOCAL_API}/api/enrich`, { method: 'POST' })
      if (!resp.ok) throw new Error(`Server error ${resp.status}`)
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'log') {
              setEnrichLog(prev => [...prev, evt.message])
            } else if (evt.type === 'done') {
              setEnrichResult(evt.result)
              setEnriching(false)
            } else if (evt.type === 'error') {
              setEnrichError(evt.message)
              setEnriching(false)
            }
          } catch {}
        }
      }
    } catch (err) {
      setEnrichError(err.message.includes('fetch')
        ? `Cannot connect to local API server. Run: .venv/bin/python3 src/local_api.py`
        : err.message)
      setEnriching(false)
    }
  }

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    const els = SIDEBAR_DEFS.map(s => document.getElementById(s.id)).filter(Boolean)
    if (!els.length) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [caseId])

  const docketEntries  = c.docketEntries ?? []
  const timeline       = c.timeline ?? []
  const keyEntries     = docketEntries.filter(e => e.isKey)
  const visibleEntries = showAll ? docketEntries : keyEntries

  // Cost calculations
  const geminiCalls = TOKEN_USAGE?.gemini?.calls ?? []
  const costs       = calcGeminiCosts(geminiCalls, costTier, GEMINI_PRICING)
  const totalInput  = geminiCalls.reduce((s, x) => s + x.inputTokens, 0)
  const totalOutput = geminiCalls.reduce((s, x) => s + x.outputTokens, 0)
  const totalCost   = costs.reduce((s, x) => s + x.total, 0)

  // Defendant grouping
  const { grouped: defGroups, ungrouped: defUngrouped } = groupDefendants(c.defendants ?? [], DEFENDANT_GROUPS)
  const allDefFlat = [
    ...defGroups.flatMap(g => g.members.map(m => ({ ...m, _group: g.label, _color: g.color }))),
    ...defUngrouped.map(m => ({ ...m, _group: null, _color: null })),
  ]
  const plaintiffs = c.plaintiffs ?? []
  const visPlaintiffs = showAllParties ? plaintiffs : plaintiffs.slice(0, PARTIES_PREVIEW)
  const hiddenPCount = Math.max(0, plaintiffs.length - PARTIES_PREVIEW)
  const hiddenDCount = Math.max(0, allDefFlat.length - PARTIES_PREVIEW)

  const statusInfo = deriveStatusInfo(CASE_STATUS_LABEL)

  // Construct CourtListener search URL from docket number
  const clDocketNum = c.id
    ? c.id.replace(/^(\d+)-(\d{2}-[a-z]+-\d+)$/, '$1:$2')
    : null
  const clSearchUrl = clDocketNum
    ? `https://www.courtlistener.com/?q=%22${encodeURIComponent(clDocketNum)}%22&type=r`
    : null

  const sidebarSections = SIDEBAR_DEFS.filter(s => {
    if (s.id === 'sec-parties')    return plaintiffs.length > 0 || allDefFlat.length > 0
    if (s.id === 'sec-laws')       return (LAWS_AT_ISSUE ?? []).length > 0
    if (s.id === 'sec-news')       return c.backgroundArticles?.length > 0
    if (s.id === 'sec-appeals')    return c.courts?.length > 0
    if (s.id === 'sec-timeline')   return timeline.length > 0
    if (s.id === 'sec-actions')    return keyEntries.length > 0
    return true
  })

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      {/* ── Sidebar navigation ──────────────────────────────────── */}
      <nav className="case-sidebar" aria-label="Page sections">
        <div className="case-sidebar-inner">
          <div className="case-sidebar-title">On This Page</div>
          <ul className="case-sidebar-list">
            {sidebarSections.map(s => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`case-sidebar-link${activeSection === s.id ? ' case-sidebar-link--active' : ''}`}
                  onClick={e => {
                    e.preventDefault()
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/cases')}>← All Cases</button>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="case-header">
        <h1 className="case-title">{c.case_name}</h1>
        <div className="case-header-tags">
          <span className={`status-badge ${statusInfo.cls}`}>{statusInfo.text}</span>
          <span className="case-status-label-chip">{CASE_STATUS_LABEL}</span>
          {OVERALL_FAVORABILITY && (
            <span className={`favorability-badge favorability-badge--${OVERALL_FAVORABILITY.side}`}
              title={OVERALL_FAVORABILITY.reasoning}>
              {OVERALL_FAVORABILITY.side === 'plaintiff' ? '▲' : OVERALL_FAVORABILITY.side === 'defendant' ? '▼' : '—'}{' '}
              {OVERALL_FAVORABILITY.label}
            </span>
          )}
          {c.courts?.[0] && (
            <span className="court-tag-badge">
              <svg viewBox="0 0 12 12" fill="none" className="court-tag-icon">
                <path d="M1 11h10M2 11V5.5M10 11V5.5M6 11V5.5M1 5.5l5-4 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {c.courts[0].name}
            </span>
          )}
          <span className="gemini-ai-badge">
            <svg viewBox="0 0 16 16" fill="none" className="gemini-ai-icon">
              <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            Gemini Analysis
          </span>
        </div>
        <div className="case-meta">
          <span>Filed {formatDate(c.date_filed)}</span>
          <span className="case-meta-divider">·</span>
          <span>{c.court}</span>
        </div>
        <div className="case-judges-row">
          {JUDICIAL_INFO?.presiding && (
            <span className="case-judge-chip">
              <span className="case-judge-role">Presiding</span>
              <JudgeLink names={JUDICIAL_INFO.presiding.name} />
            </span>
          )}
          {JUDICIAL_INFO?.magistrate && (
            <span className="case-judge-chip">
              <span className="case-judge-role">Magistrate</span>
              <JudgeLink names={JUDICIAL_INFO.magistrate.name} />
            </span>
          )}
          {!JUDICIAL_INFO && c.judge && (
            <span className="case-judge-chip">
              <span className="case-judge-role">Judge</span>
              <JudgeLink names={c.judge} />
            </span>
          )}
        </div>
        <ShareWidget caseData={{ name: c.case_name, court: c.court }} />
        <p className="case-description">{c.plaintiff_summary}</p>
      </header>

      {/* ── Parties: Plaintiffs & Grouped Defendants ──────────────── */}
      {(plaintiffs.length > 0 || allDefFlat.length > 0) && (
        <section id="sec-parties" className="parties-section">
          <div className="parties-section-header">
            <h2 className="section-heading" style={{ margin: 0 }}>Parties</h2>
            {(hiddenPCount > 0 || hiddenDCount > 0) && (
              <button className="parties-expand-btn" onClick={() => setShowAllParties(v => !v)}>
                {showAllParties
                  ? 'Show fewer'
                  : `Show all ${plaintiffs.length + allDefFlat.length} parties`}
              </button>
            )}
          </div>

          <div className="parties-grid parties-grid--wide">
            {plaintiffs.length > 0 && (
              <div className="parties-col">
                <div className="parties-col-label parties-col-label--plaintiff">
                  Plaintiffs
                  <span className="parties-col-count">{plaintiffs.length}</span>
                </div>
                <ul className="parties-list">
                  {visPlaintiffs.map((p, i) => (
                    <li key={i} className="parties-item">
                      {p.wikipediaUrl ? (
                        <a href={p.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="parties-name parties-wiki-link">{p.name}</a>
                      ) : (
                        <span className="parties-name">{p.name}</span>
                      )}
                      {p.description && <span className="parties-desc">{p.description}</span>}
                    </li>
                  ))}
                </ul>
                {!showAllParties && hiddenPCount > 0 && (
                  <button className="parties-more-btn" onClick={() => setShowAllParties(true)}>
                    +{hiddenPCount} more
                  </button>
                )}
              </div>
            )}

            <div className="parties-col parties-col--defendants">
              <div className="parties-col-label parties-col-label--defendant">
                Defendants
                <span className="parties-col-count">{allDefFlat.length}</span>
              </div>

              {showAllParties ? (
                <>
                  {defGroups.map((grp, gi) => (
                    <div key={gi} className="def-group">
                      <div className="def-group-label" style={{ color: grp.color }}>{grp.label}</div>
                      <ul className="parties-list">
                        {grp.members.map((d, i) => (
                          <li key={i} className="parties-item">
                            {d.wikipediaUrl ? (
                              <a href={d.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="parties-name parties-wiki-link">{d.name}</a>
                            ) : (
                              <span className="parties-name">{d.name}</span>
                            )}
                            {d.description && <span className="parties-desc">{d.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {defUngrouped.length > 0 && (
                    <div className="def-group">
                      <div className="def-group-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Other</div>
                      <ul className="parties-list">
                        {defUngrouped.map((d, i) => (
                          <li key={i} className="parties-item">
                            <span className="parties-name">{d.name}</span>
                            {d.description && <span className="parties-desc">{d.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ul className="parties-list">
                    {allDefFlat.slice(0, PARTIES_PREVIEW).map((d, i) => (
                      <li key={i} className="parties-item">
                        {d._group && (
                          <span className="parties-group-tag" style={{ color: d._color }}>{d._group}</span>
                        )}
                        {d.wikipediaUrl ? (
                          <a href={d.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="parties-name parties-wiki-link">{d.name}</a>
                        ) : (
                          <span className="parties-name">{d.name}</span>
                        )}
                        {d.description && <span className="parties-desc">{d.description}</span>}
                      </li>
                    ))}
                  </ul>
                  {hiddenDCount > 0 && (
                    <button className="parties-more-btn" onClick={() => setShowAllParties(true)}>
                      +{hiddenDCount} more
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Case Background ─────────────────────────────────────── */}
      <section id="sec-background" className="gemini-context-section">
        <h2 className="section-heading">Case Background</h2>
        <div className="gemini-context-card">
          <div className="gemini-context-row">
            <div className="gemini-context-label">Executive Action</div>
            <div className="gemini-context-date">{formatDate(c.executive_action_date)}</div>
            <p className="gemini-context-text">
              <AnnotatedText text={c.executive_action_description} />
            </p>
          </div>
          <div className="gemini-context-divider" />
          <div className="gemini-context-row">
            <div className="gemini-context-label">Constitutional Stakes</div>
            <p className="gemini-context-text">
              <AnnotatedText text={c.constitutional_stakes} />
            </p>
          </div>
          {c.citizen_stakes && (
            <>
              <div className="gemini-context-divider" />
              <div className="gemini-context-row">
                <div className="gemini-context-label why-it-matters-label">Why It Matters</div>
                <p className="gemini-context-text">
                  <AnnotatedText text={c.citizen_stakes} />
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Executive Action Status — YELLOW HIGHLIGHT ────────────── */}
      <section id="sec-status" className="exec-status-section">
        <div className="exec-status-card exec-status-card--warning">
          <div className="exec-status-top">
            <div className="exec-status-label-row">
              <span className="exec-status-pill exec-status-pill--warning">Current Status</span>
              <span className="exec-status-as-of">As of {formatDate(EXECUTIVE_STATUS.asOf)}</span>
            </div>
            <h3 className="exec-status-headline">{EXECUTIVE_STATUS.headline}</h3>
          </div>

          {OVERALL_FAVORABILITY && (
            <div className={`exec-status-favorability exec-status-favorability--${OVERALL_FAVORABILITY.side}`}>
              <span className="exec-status-fav-icon">
                {OVERALL_FAVORABILITY.side === 'plaintiff' ? '▲' : OVERALL_FAVORABILITY.side === 'defendant' ? '▼' : '—'}
              </span>
              <div className="exec-status-fav-content">
                <span className="exec-status-fav-label">{OVERALL_FAVORABILITY.label}</span>
                {OVERALL_FAVORABILITY.reasoning && (
                  <span className="exec-status-fav-reasoning">{OVERALL_FAVORABILITY.reasoning}</span>
                )}
              </div>
            </div>
          )}

          <p className="exec-status-summary">
            <AnnotatedText text={EXECUTIVE_STATUS.summary} />
          </p>
          <p className="exec-status-detail">
            <AnnotatedText text={EXECUTIVE_STATUS.detail} />
          </p>

          <div className="exec-status-next">
            <div className="exec-status-next-label">Likely next steps</div>
            <ul className="exec-status-next-list">
              {(EXECUTIVE_STATUS.nextSteps ?? []).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <a
            href={EXECUTIVE_STATUS.citationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="exec-status-cite"
          >
            <svg viewBox="0 0 14 14" fill="none" className="exec-status-cite-icon">
              <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M9 2v3h3M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Source: {EXECUTIVE_STATUS.citationLabel}
          </a>
        </div>
      </section>

      {/* ── Laws at Issue ─────────────────────────────────────────── */}
      <section id="sec-laws" className="laws-section">
        <h2 className="section-heading">Laws Being Challenged</h2>
        <div className="laws-grid">
          {LAWS_AT_ISSUE.map((law, i) => (
            <div key={i} className="law-card">
              <div className="law-card-top">
                <a href={law.url} target="_blank" rel="noopener noreferrer" className="law-citation">
                  {law.citation}
                </a>
                <span className="law-short-name">{law.shortName}</span>
              </div>
              <p className="law-claim">
                {law.termKey
                  ? <LegalTooltip termKey={law.termKey}>{law.claim}</LegalTooltip>
                  : law.claim}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Background News Articles ─────────────────────────────── */}
      {c.backgroundArticles && c.backgroundArticles.length > 0 && (
        <section id="sec-news" className="gemini-news-section">
          <h2 className="section-heading">In the News</h2>
          <p className="gemini-news-sub">Background on the events that led to this case</p>
          <div className="gemini-news-grid">
            {c.backgroundArticles.map((art, i) => (
              <a
                key={i}
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gemini-news-card"
              >
                <div className="gemini-news-card-top">
                  <span className="gemini-news-source">{art.source}</span>
                  {art.date && <span className="gemini-news-date">{formatDate(art.date)}</span>}
                </div>
                <div className="gemini-news-title">{art.title}</div>
                <p className="gemini-news-desc">{art.description}</p>
                <span className="gemini-news-arrow">Read article →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Court progression — clickable by level ───────────────── */}
      {c.courts && c.courts.length > 0 && (
        <section id="sec-appeals" className="courts-section">
          <h2 className="section-heading">Appeals Tracker</h2>
          <p className="courts-hint">Click a court to filter all cases at that level.</p>
          <CourtsTierTrack courts={c.courts} />
        </section>
      )}

      {/* ── Timeline — key moments ────────────────────────────────── */}
      {timeline.length > 0 && (
        <section id="sec-timeline" className="timeline-section">
          <div className="timeline-header-row">
            <h2 className="section-heading" style={{ margin: 0 }}>Key Moments</h2>
            <button className="dict-nav-btn" onClick={() => navigate('/dictionary')}>
              <svg viewBox="0 0 14 14" fill="none" className="dict-nav-icon">
                <path d="M2 11V2h8l2 2v7a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M5 6h4M5 8.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Legal Term Dictionary
            </button>
          </div>
          <p className="timeline-tooltip-hint">
            <span className="timeline-tooltip-sample">Legal terms</span> are highlighted — hover to define.
            Type badges with a document icon are hoverable to open the source.
          </p>
          <div className="timeline">
            {timeline.map((event, i) => {
              const isLast = i === timeline.length - 1
              const docUrl = TIMELINE_DOCS[event.entry_number]
              return (
                <div key={i} className={`timeline-item ${isLast ? 'timeline-item--last' : ''}`}>
                  <div className="timeline-left">
                    <div
                      className="timeline-dot"
                      style={{
                        background: (TYPE_CONFIG[event.type] || {}).color || 'rgba(255,255,255,0.3)',
                        boxShadow: `0 0 0 3px rgba(10,10,15,1), 0 0 0 4px ${(TYPE_CONFIG[event.type] || {}).color || 'rgba(255,255,255,0.3)'}40`,
                      }}
                    />
                    {!isLast && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date-row">
                      <span className="timeline-date">{formatDate(event.date)}</span>
                    </div>
                    <div className="timeline-event-header">
                      <TypeBadge type={event.type} docUrl={docUrl} />
                      <span className="timeline-event-title">{event.title}</span>
                    </div>
                    <p className="timeline-event-desc">
                      <AnnotatedText text={event.description} />
                    </p>
                    {docUrl && (
                      <a href={docUrl} target="_blank" rel="noopener noreferrer" className="gemini-doc-link">
                        <svg viewBox="0 0 14 14" fill="none" className="gemini-doc-icon">
                          <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          <path d="M9 2v3h3M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        View Source Document
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Docket Entry Summaries: Key / All Actions ─────────────── */}
      <section id="sec-actions" className="actions-section">
        <div className="actions-header">
          <div className="actions-header-top">
            <h2 className="section-heading" style={{ margin: 0 }}>
              {showAll ? 'All Actions' : 'Key Actions'}
            </h2>
            {clSearchUrl && (
              <a
                href={clSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cl-docket-link"
              >
                <svg viewBox="0 0 14 14" fill="none" className="cl-docket-icon">
                  <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M9 2v3h3M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                View full docket on CourtListener
              </a>
            )}
          </div>
          <div className="actions-toggle" role="group" aria-label="Actions filter">
            <button
              className={`toggle-seg ${!showAll ? 'toggle-seg--on' : ''}`}
              onClick={() => setShowAll(false)}
            >
              Key Actions
            </button>
            <button
              className={`toggle-seg ${showAll ? 'toggle-seg--on' : ''}`}
              onClick={() => setShowAll(true)}
            >
              All Actions
              <span className="toggle-seg-count">{docketEntries.length}</span>
            </button>
          </div>
        </div>

        <div className="actions-list">
          {visibleEntries.map((entry, i) => {
            const cls    = ACTION_CLASSIFICATIONS[entry.entryNumber]
            const enrich = ACTION_ENRICHMENTS[entry.entryNumber]
            return (
              <div key={i} className="action-row">
                <div className="action-row-top">
                  <span className="action-date">{formatDate(entry.date)}</span>
                  <span className="action-court">Entry #{entry.entryNumber}</span>
                  {entry.isKey && <span className="gemini-key-badge">Key Action</span>}
                  {entry.isKey && cls && (
                    <span className={`action-class-badge action-class-badge--${cls.side}`}>
                      {cls.side === 'plaintiff' ? '▲ Favors Plaintiff'
                        : cls.side === 'defendant' ? '▼ Favors Defendant'
                        : '— Neutral'}
                    </span>
                  )}
                </div>

                <div className="action-title">
                  {enrich?.title ?? `Entry #${entry.entryNumber}`}
                </div>

                <p className="action-desc">
                  <AnnotatedText text={enrich?.description ?? entry.summary} />
                </p>

                {entry.isKey && cls && cls.side !== 'neutral' && (
                  <div className={`action-class-reason action-class-reason--${cls.side}`}>
                    <svg viewBox="0 0 12 12" fill="none" className="acr-icon">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    {cls.reason}
                  </div>
                )}

                {entry.pdfUrl ? (
                  <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer" className="gemini-doc-link">
                    <svg viewBox="0 0 14 14" fill="none" className="gemini-doc-icon">
                      <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      <path d="M9 2v3h3M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    View Document
                  </a>
                ) : clSearchUrl ? (
                  <a href={clSearchUrl} target="_blank" rel="noopener noreferrer" className="gemini-doc-link gemini-doc-link--cl">
                    <svg viewBox="0 0 14 14" fill="none" className="gemini-doc-icon">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M4.5 7h5M7 4.5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    View on CourtListener
                  </a>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Enrich from Sheets ───────────────────────────────────── */}
      <section className="enrich-section">
        <div className="enrich-header">
          <div className="enrich-header-left">
            <svg viewBox="0 0 16 16" fill="none" className="enrich-sheets-icon">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="#2a9d8f" strokeWidth="1.3"/>
              <path d="M4 5h8M4 8h5M4 11h6" stroke="#2a9d8f" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div>
              <div className="enrich-title">Re-enrich from Google Sheets</div>
              <div className="enrich-subtitle">
                Reads the{' '}
                <a href={SHEETS_URL} target="_blank" rel="noopener noreferrer" className="enrich-sheet-link">
                  Test Sheet
                </a>
                , uploads the complaint PDF to Gemini, and regenerates all case data.
                Estimated cost: <strong>&lt;$0.05</strong> · Budget cap: <strong>$2.00</strong>
              </div>
            </div>
          </div>
          <button
            className={`enrich-btn ${enriching ? 'enrich-btn--running' : ''}`}
            onClick={runEnrichment}
            disabled={enriching}
          >
            {enriching ? (
              <>
                <span className="enrich-spinner" />
                Running…
              </>
            ) : (
              <>
                <svg viewBox="0 0 14 14" fill="none" className="enrich-btn-icon">
                  <path d="M7 2v2M7 10v2M2 7h2M10 7h2M3.5 3.5l1.5 1.5M9 9l1.5 1.5M3.5 10.5L5 9M9 5l1.5-1.5"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Enrich from Sheets
              </>
            )}
          </button>
        </div>

        {!enriching && !enrichResult && !enrichError && (
          <div className="enrich-setup-note">
            <strong>Setup:</strong> start the local API server first:{' '}
            <code className="enrich-cmd">.venv/bin/python3 src/local_api.py</code>
            <span className="enrich-sep">·</span>
            For Sheets write-back, place a service account JSON at{' '}
            <code className="enrich-cmd">src/sheets_sa.json</code>
          </div>
        )}

        {(enrichLog.length > 0 || enriching) && (
          <div className="enrich-log">
            {enrichLog.map((msg, i) => (
              <div key={i} className={`enrich-log-line ${msg.includes('✓') ? 'enrich-log-line--ok' : msg.includes('✗') || msg.includes('Error') ? 'enrich-log-line--err' : ''}`}>
                {msg}
              </div>
            ))}
            {enriching && <div className="enrich-log-line enrich-log-line--pulse">▌</div>}
          </div>
        )}

        {enrichResult && (
          <div className="enrich-result enrich-result--ok">
            <svg viewBox="0 0 14 14" fill="none" className="enrich-result-icon">
              <circle cx="7" cy="7" r="6" stroke="#2a9d8f" strokeWidth="1.3"/>
              <path d="M4 7l2 2 4-4" stroke="#2a9d8f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div className="enrich-result-title">Enrichment complete</div>
              <div className="enrich-result-meta">
                Gemini cost: <strong>${enrichResult.cost_usd?.toFixed(5)}</strong>
                {' · '}Tokens: <strong>{(enrichResult.input_tokens + enrichResult.output_tokens)?.toLocaleString()}</strong>
                {' · '}Sheets write: <strong>{enrichResult.sheets_written ? '✓ written' : '✗ skipped (no auth)'}</strong>
              </div>
              <div className="enrich-result-meta">
                Reload the page to see updated content.
              </div>
            </div>
          </div>
        )}

        {enrichError && (
          <div className="enrich-result enrich-result--err">
            <svg viewBox="0 0 14 14" fill="none" className="enrich-result-icon">
              <circle cx="7" cy="7" r="6" stroke="#e63946" strokeWidth="1.3"/>
              <path d="M5 5l4 4M9 5l-4 4" stroke="#e63946" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div>
              <div className="enrich-result-title">Error</div>
              <div className="enrich-result-meta">{enrichError}</div>
            </div>
          </div>
        )}
      </section>

      {/* ── Admin Box ────────────────────────────────────────────── */}
      <section className="admin-section">
        <button
          className="admin-toggle"
          onClick={() => setAdminOpen(v => !v)}
          aria-expanded={adminOpen}
        >
          <span className="admin-toggle-label">
            <svg viewBox="0 0 14 14" fill="none" className="admin-icon">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 7h6M4 5h3M4 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Admin: Generation Cost &amp; API Breakdown
          </span>
          <span className="admin-toggle-chevron">{adminOpen ? '▲' : '▼'}</span>
        </button>

        {adminOpen && (
          <div className="admin-box">
            <div className="admin-box-intro">
              Token usage and API costs to generate this case page using the CourtListener RECAP API and Gemini AI.
            </div>

            {/* ── PACER / CourtListener ── */}
            <div className="admin-block">
              <div className="admin-block-title">CourtListener RECAP API — PACER Request Usage</div>
              <p className="admin-block-note">{PACER_USAGE.note}</p>

              {PACER_USAGE.requests.map((req, i) => (
                <div key={i} className="admin-row">
                  <span className="admin-row-label">{req.label}</span>
                  <span className="admin-row-val admin-row-val--mono">{req.endpoint}</span>
                  <span className="admin-row-cost admin-row-cost--free">+{req.count} req</span>
                </div>
              ))}

              <div className="admin-row admin-row--total">
                <span className="admin-row-label">This case total</span>
                <span className="admin-row-val">{PACER_USAGE.totalRequests} requests</span>
                <span className="admin-row-cost admin-row-cost--free">
                  {fmtPct(PACER_USAGE.totalRequests, PACER_USAGE.lifetimeCap)} of {PACER_USAGE.lifetimeCap.toLocaleString()} cap
                </span>
              </div>

              <div className="admin-pacer-bar">
                <div
                  className="admin-pacer-fill"
                  style={{ width: `${Math.min((PACER_USAGE.totalRequests / PACER_USAGE.lifetimeCap) * 100, 100)}%` }}
                />
              </div>

              {PACER_USAGE.projections && (<>
              <div className="admin-block-title" style={{ marginTop: '1rem' }}>Projected Usage at Scale</div>
              <div className="admin-projections">
                {PACER_USAGE.projections.map((p, i) => (
                  <div key={i} className="admin-proj-row">
                    <span className="apr-cases">{p.cases.toLocaleString()} cases</span>
                    <span className="apr-reqs">{p.requests.toLocaleString()} requests</span>
                    <span className={`apr-pct ${p.requests >= PACER_USAGE.lifetimeCap * 0.5 ? 'apr-pct--warn' : ''}`}>
                      {fmtPct(p.requests, PACER_USAGE.lifetimeCap)} of cap
                    </span>
                    <div className="apr-bar-wrap">
                      <div
                        className="apr-bar-fill"
                        style={{ width: `${Math.min((p.requests / PACER_USAGE.lifetimeCap) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              </>)}
            </div>

            {/* ── CourtListener tokens ── */}
            {TOKEN_USAGE.courtListener && (
              <div className="admin-block">
                <div className="admin-block-title">CourtListener Raw Data (Tokens)</div>
                {TOKEN_USAGE.courtListener.calls.map((call, i) => (
                  <div key={i} className="admin-row">
                    <span className="admin-row-label">{call.label}</span>
                    <span className="admin-row-val">{fmtTokens(call.tokens)} tokens</span>
                    <span className="admin-row-cost admin-row-cost--free">Free</span>
                  </div>
                ))}
                <div className="admin-row admin-row--total">
                  <span className="admin-row-label">Total fetched</span>
                  <span className="admin-row-val">{fmtTokens(TOKEN_USAGE.courtListener.totalTokens)} tokens</span>
                  <span className="admin-row-cost admin-row-cost--free">$0.0000</span>
                </div>
              </div>
            )}

            {/* ── Gemini calls ── */}
            <div className="admin-block">
              <div className="admin-block-header">
                <div className="admin-block-title">Gemini 2.5 Pro API Calls</div>
                <div className="admin-tier-toggle" role="group">
                  <button
                    className={`admin-tier-seg ${costTier === '<=200k' ? 'admin-tier-seg--on' : ''}`}
                    onClick={() => setCostTier('<=200k')}
                  >
                    ≤200k context
                  </button>
                  <button
                    className={`admin-tier-seg ${costTier === '>200k' ? 'admin-tier-seg--on' : ''}`}
                    onClick={() => setCostTier('>200k')}
                  >
                    &gt;200k context
                  </button>
                </div>
              </div>

              <div className="admin-pricing-ref">
                <span>Input: <strong>${costTier === '<=200k' ? '2.00' : '4.00'}/1M tokens</strong></span>
                <span>Output: <strong>${costTier === '<=200k' ? '12.00' : '18.00'}/1M tokens</strong></span>
                <span>Cache read: <strong>${costTier === '<=200k' ? '0.20' : '0.40'}/1M tokens</strong></span>
                <span>Cache storage: <strong>$4.50/1M tokens/hr</strong></span>
              </div>

              {costs.map((call, i) => (
                <div key={i} className="admin-phase">
                  <div className="admin-phase-title">{call.phase}</div>
                  <div className="admin-phase-desc">{call.description}</div>
                  <div className="admin-phase-stats">
                    <div className="admin-phase-stat">
                      <span className="aps-label">Input tokens</span>
                      <span className="aps-val">{fmtTokens(call.inputTokens)}</span>
                      <span className="aps-cost">{fmtDollar(call.inputCost)}</span>
                    </div>
                    <div className="admin-phase-stat">
                      <span className="aps-label">Output tokens</span>
                      <span className="aps-val">{fmtTokens(call.outputTokens)}</span>
                      <span className="aps-cost">{fmtDollar(call.outputCost)}</span>
                    </div>
                    <div className="admin-phase-stat admin-phase-stat--subtotal">
                      <span className="aps-label">Phase total</span>
                      <span className="aps-val">—</span>
                      <span className="aps-cost">{fmtDollar(call.total)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="admin-row admin-row--total" style={{ marginTop: '0.75rem' }}>
                <span className="admin-row-label">Total input</span>
                <span className="admin-row-val">{fmtTokens(totalInput)} tokens</span>
                <span className="admin-row-cost">{fmtDollar(costs.reduce((s, x) => s + x.inputCost, 0))}</span>
              </div>
              <div className="admin-row admin-row--total">
                <span className="admin-row-label">Total output</span>
                <span className="admin-row-val">{fmtTokens(totalOutput)} tokens</span>
                <span className="admin-row-cost">{fmtDollar(costs.reduce((s, x) => s + x.outputCost, 0))}</span>
              </div>
              <div className="admin-row admin-row--grand">
                <span className="admin-row-label">Grand total (Gemini)</span>
                <span className="admin-row-val">{fmtTokens(totalInput + totalOutput)} tokens</span>
                <span className="admin-row-cost admin-row-cost--highlight">{fmtDollar(totalCost)}</span>
              </div>
            </div>

            {/* ── Caching note ── */}
            {TOKEN_USAGE.courtListener && (
              <div className="admin-block admin-block--note">
                <div className="admin-block-title">Context Caching Potential</div>
                <p className="admin-block-note">
                  If the full docket ({fmtTokens(TOKEN_USAGE.courtListener.totalTokens)} tokens) were stored in Gemini context cache
                  for one hour, the storage cost would be approximately {fmtDollar((TOKEN_USAGE.courtListener.totalTokens / 1_000_000) * GEMINI_PRICING.cacheStorageHour)} per hour.
                  Subsequent reads of cached content would cost {fmtDollar((TOKEN_USAGE.courtListener.totalTokens / 1_000_000) * (costTier === '<=200k' ? GEMINI_PRICING.cacheRead.lte200k : GEMINI_PRICING.cacheRead.gt200k))} per read
                  vs. {fmtDollar((TOKEN_USAGE.courtListener.totalTokens / 1_000_000) * (costTier === '<=200k' ? GEMINI_PRICING.input.lte200k : GEMINI_PRICING.input.gt200k))} for a standard input read —
                  a <strong>{Math.round((1 - GEMINI_PRICING.cacheRead[costTier === '<=200k' ? 'lte200k' : 'gt200k'] / GEMINI_PRICING.input[costTier === '<=200k' ? 'lte200k' : 'gt200k']) * 100)}%</strong> reduction.
                </p>
              </div>
            )}

            <div className="admin-footer">
              Generated {new Date(GENERATED_AT).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })} by Gemini AI.
              Token counts are estimates; actual API costs may vary.
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>
          Analysis generated by Gemini AI on {new Date(GENERATED_AT).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          Summaries are AI-generated — verify against original court records.
        </p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
