import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JudgeLink from '../components/JudgeLink'
import { ISSUES, ALL_CASES } from '../data/issues'
import { CL_CASES } from '../data/clCases'
import { GEMINI_CASES } from '../data/geminiCaseData'
import { GEMINI_CASES_ALL, CASES_REGISTRY } from '../data/casesRegistry'
import { COURT_TO_CIRCUIT, CIRCUIT_NAMES } from '../data/courtCircuits'
import './AllCasesPage.css'

const PAGE_SIZE = 50

// Derive normalized status from a Gemini CASE_STATUS_LABEL string
function deriveStatusInfo(label) {
  if (!label) return { value: 'active', text: 'Active', cls: 'badge-active' }
  const l = label.toLowerCase()
  if (l.includes('dismiss')) {
    return { value: 'closed-against', text: 'Dismissed', cls: 'badge-closed-against' }
  }
  if (l.includes('decided for plaintiff') || l.includes('ruling for plaintiff')) {
    return { value: 'closed-for', text: 'Closed — For', cls: 'badge-closed-for' }
  }
  if (l.includes('injunction') && !l.includes('denied') && !l.includes('appeal')) {
    return { value: 'injunction', text: 'Injunction', cls: 'badge-injunction' }
  }
  return { value: 'active', text: 'Active', cls: 'badge-active' }
}

// Normalize GEMINI_CASES_ALL status values from their CASE_STATUS_LABEL
const GEMINI_CASES_NORMALIZED = GEMINI_CASES_ALL.map(entry => {
  const mod = CASES_REGISTRY[entry.id]
  if (!mod?.CASE_STATUS_LABEL) return entry
  const si = deriveStatusInfo(mod.CASE_STATUS_LABEL)
  if (si.value === entry.status) return entry
  return { ...entry, status: si.value }
})

// All cases: example (annotated) + CL-synced + Gemini-analyzed
const COMBINED_CASES = [...ALL_CASES, ...CL_CASES, ...GEMINI_CASES, ...GEMINI_CASES_NORMALIZED]

const STATUS_OPTIONS = [
  { value: 'active',         label: 'Active',            color: '#457b9d' },
  { value: 'injunction',     label: 'Injunction',        color: '#f4a261' },
  { value: 'closed-for',     label: 'Closed — For',      color: '#2a9d8f' },
  { value: 'closed-against', label: 'Closed — Against',  color: '#e63946' },
]

const STATUS_CONFIG = {
  'active':         { label: 'Active',           cls: 'badge-active' },
  'injunction':     { label: 'Injunction',       cls: 'badge-injunction' },
  'closed-for':     { label: 'Closed — For',     cls: 'badge-closed-for' },
  'closed-against': { label: 'Closed — Against', cls: 'badge-closed-against' },
}

function courtLevel(court) {
  if (!court) return null
  const c = court.toLowerCase()
  if (c === 'scotus' || c.includes('supreme')) return 'supreme'
  if (c.includes('cir.') || c.includes('circuit') || c.includes('court of appeals')) return 'appeals'
  return 'district'
}

// Unique filing courts sorted by frequency across all cases
const COURT_OPTIONS = (() => {
  const counts = {}
  COMBINED_CASES.forEach(c => { counts[c.court] = (counts[c.court] ?? 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([court]) => court)
    .slice(0, 20) // top 20 courts only to keep filter bar manageable
})()

const ASSIGNEE_ORDER = ['Collin', 'Spencer', 'James', 'Manouny', 'Yusur', 'Quinlen']
const ASSIGNEE_OPTIONS = ASSIGNEE_ORDER.filter(
  name => COMBINED_CASES.some(c => c.assignee === name)
)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Single case row (works for both example and CL cases) ─────────────────────
function CaseRow({ c, onClick }) {
  const cfg = STATUS_CONFIG[c.status] || { label: c.status, cls: 'badge-active' }
  return (
    <button
      className="case-row case-row--clickable"
      onClick={() => onClick(c)}
    >
      <div className="case-row-main">
        <div className="case-name-wrap">
          <span className="case-issue-dot" style={{ background: c.issueColor }} />
          <span className="case-name">{c.name}</span>
          {c.example && <span className="example-badge">Example</span>}
          {c.geminiCase && <span className="gemini-list-badge">✦ Gemini</span>}
        </div>
        <div className="case-row-right">
          <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
          <span className="case-row-arrow">→</span>
        </div>
      </div>
      <div className="case-row-meta">
        {c.issueTitle && (
          <>
            <span className="case-meta-item case-issue-label">{c.issueTitle}</span>
            <span className="case-meta-divider">·</span>
          </>
        )}
        <span className="case-meta-item">{c.court}</span>
        {c.dateFiled && (
          <>
            <span className="case-meta-divider">·</span>
            <span className="case-meta-item">Filed {formatDate(c.dateFiled)}</span>
          </>
        )}
        {c.judge && (
          <>
            <span className="case-meta-divider">·</span>
            <span className="case-meta-item">
              <JudgeLink names={c.judge} />
            </span>
          </>
        )}
        <span className="case-meta-divider">·</span>
        <span className="case-meta-item case-id-label">{c.docketNumber || c.id}</span>
      </div>
      {c.description ? (
        <p className="case-description">{c.description}</p>
      ) : c.natureOfSuit ? (
        <p className="case-description case-description--meta">{c.natureOfSuit}{c.cause ? ` · ${c.cause}` : ''}</p>
      ) : null}
    </button>
  )
}

export default function AllCasesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [page, setPage]     = useState(1)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const activeStatus   = params.get('status')   ?? ''
  const activeTopic    = params.get('topic')    ?? ''
  const activeCourt    = params.get('court')    ?? ''
  const activeCircuit  = params.get('circuit')  ?? ''
  const activeLevel    = params.get('level')    ?? ''
  const activeAssignee = params.get('assignee') ?? ''
  const searchQ        = params.get('q')        ?? ''

  const hasFilters = activeStatus || activeTopic || activeCourt || activeCircuit || activeLevel || activeAssignee || searchQ

  function setFilter(key, value) {
    const next = new URLSearchParams(params)
    if (next.get(key) === value) next.delete(key)
    else next.set(key, value)
    setParams(next)
    setPage(1)
  }

  function setCourtFilter(court) {
    const next = new URLSearchParams(params)
    if (next.get('court') === court) {
      next.delete('court')
    } else {
      next.set('court', court)
      const lvl = courtLevel(court)
      if (lvl) next.set('level', lvl)
    }
    setParams(next)
    setPage(1)
  }

  function clearAll() { setParams({}); setPage(1) }

  // Filtered flat list across all cases
  const filtered = useMemo(() => {
    let list = COMBINED_CASES
    if (activeStatus)   list = list.filter(c => c.status === activeStatus)
    if (activeTopic)    list = list.filter(c => c.issueSlug === activeTopic)
    if (activeCourt)    list = list.filter(c => c.court === activeCourt)
    if (activeCircuit)  list = list.filter(c => COURT_TO_CIRCUIT[c.court] === activeCircuit)
    if (activeLevel)    list = list.filter(c => courtLevel(c.court) === activeLevel)
    if (activeAssignee) list = list.filter(c => c.assignee === activeAssignee)
    if (searchQ) {
      const q = searchQ.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.docketNumber || '').toLowerCase().includes(q) ||
        (c.court || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.issueTitle || '').toLowerCase().includes(q) ||
        (c.judge || '').toLowerCase().includes(q) ||
        (c.natureOfSuit || '').toLowerCase().includes(q) ||
        (c.assignee || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [activeStatus, activeTopic, activeCourt, activeCircuit, activeLevel, activeAssignee, searchQ])

  // Grouped by issue (for unfiltered view)
  const grouped = useMemo(() => {
    // Collect all unique issue slugs across combined cases
    const issueMap = {}
    // First: ISSUES order
    ISSUES.forEach(issue => {
      issueMap[issue.slug] = { slug: issue.slug, title: issue.title, color: issue.color, cases: [] }
    })
    // Assign cases
    COMBINED_CASES.forEach(c => {
      const slug = c.issueSlug
      if (slug && issueMap[slug]) {
        issueMap[slug].cases.push(c)
      }
    })
    return Object.values(issueMap).filter(g => g.cases.length > 0)
  }, [])

  // Status counts (computed once from the full combined list)
  const statusCounts = useMemo(() =>
    STATUS_OPTIONS.reduce((acc, s) => {
      acc[s.value] = COMBINED_CASES.filter(c => c.status === s.value).length
      return acc
    }, {})
  , [])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const totalLabel = hasFilters
    ? activeCircuit && !activeStatus && !activeTopic && !activeCourt && !searchQ
      ? `${filtered.length} cases in the ${CIRCUIT_NAMES[activeCircuit] || activeCircuit}`
      : `${filtered.length} case${filtered.length !== 1 ? 's' : ''} match`
    : `${COMBINED_CASES.length.toLocaleString()} cases tracked since January 20, 2025`

  function handleCaseClick(c) {
    if (c.example) {
      navigate(`/case/${c.id}`)
    } else if (c.geminiCase) {
      navigate(`/case/gemini/${c.id}`)
    } else if (c.docketNumber) {
      navigate(`/docket?n=${encodeURIComponent(c.docketNumber)}`)
    }
  }

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
      </div>

      <header className="all-cases-header">
        <h1 className="all-cases-title">All Cases</h1>
        <p className="all-cases-sub">{totalLabel}</p>
      </header>

      {/* ── Status breakdown bar ─────────────────────────── */}
      <div className="status-breakdown">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            className={`breakdown-stat${activeStatus === s.value ? ' breakdown-stat--on' : ''}`}
            style={{ '--chip-color': s.color }}
            onClick={() => setFilter('status', s.value)}
          >
            <span className="breakdown-count">{(statusCounts[s.value] ?? 0).toLocaleString()}</span>
            <span className="breakdown-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-search-wrap">
          <svg className="filter-search-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="filter-search-input"
            type="text"
            placeholder="Search cases, docket numbers, courts, judges…"
            value={searchQ}
            onChange={e => {
              const next = new URLSearchParams(params)
              if (e.target.value) next.set('q', e.target.value)
              else next.delete('q')
              setParams(next)
              setPage(1)
            }}
          />
          {searchQ && (
            <button className="filter-search-clear" onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('q')
              setParams(next)
              setPage(1)
            }}>
              <svg viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="filter-row">
          <span className="filter-row-label">Status</span>
          <div className="filter-chips">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                className={`filter-chip ${activeStatus === s.value ? 'filter-chip--on' : ''}`}
                style={{ '--chip-color': s.color }}
                onClick={() => setFilter('status', s.value)}
              >
                <span className="chip-dot" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-row-label">Topic</span>
          <div className="filter-chips filter-chips--scroll">
            {ISSUES.map(issue => (
              <button
                key={issue.slug}
                className={`filter-chip ${activeTopic === issue.slug ? 'filter-chip--on' : ''}`}
                style={{ '--chip-color': issue.color }}
                onClick={() => setFilter('topic', issue.slug)}
              >
                <span className="chip-dot" />
                {issue.title}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-row-label">Court</span>
          <div className="filter-chips filter-chips--scroll">
            {COURT_OPTIONS.map(court => (
              <button
                key={court}
                className={`filter-chip ${activeCourt === court ? 'filter-chip--on' : ''}`}
                style={{ '--chip-color': '#6fbde8' }}
                onClick={() => setCourtFilter(court)}
              >
                {court}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-row-label">Circuit</span>
          <div className="filter-chips filter-chips--scroll">
            {Object.entries(CIRCUIT_NAMES).map(([key, label]) => (
              <button
                key={key}
                className={`filter-chip ${activeCircuit === key ? 'filter-chip--on' : ''}`}
                style={{ '--chip-color': '#c77dff' }}
                onClick={() => setFilter('circuit', key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-row-label">Level</span>
          <div className="filter-chips">
            {[
              { value: 'district', label: 'District Court' },
              { value: 'appeals',  label: 'Appeals Court'  },
              { value: 'supreme',  label: 'Supreme Court'  },
            ].map(opt => (
              <button
                key={opt.value}
                className={`filter-chip ${activeLevel === opt.value ? 'filter-chip--on' : ''}`}
                style={{ '--chip-color': '#7ec8e3' }}
                onClick={() => setFilter('level', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {ASSIGNEE_OPTIONS.length > 0 && (
          <div className="filter-row">
            <span className="filter-row-label">Assigned To</span>
            <div className="filter-chips">
              {ASSIGNEE_OPTIONS.map(name => (
                <button
                  key={name}
                  className={`filter-chip ${activeAssignee === name ? 'filter-chip--on' : ''}`}
                  style={{ '--chip-color': '#c77dff' }}
                  onClick={() => setFilter('assignee', name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <button className="filter-clear-all" onClick={clearAll}>
            <svg viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Clear all filters
          </button>
        )}
      </div>

      {/* ── Case list ────────────────────────────────────── */}
      <div className="all-cases-body">
        {hasFilters ? (
          filtered.length === 0 ? (
            <div className="no-results">
              <p>No cases match the current filters.</p>
              <button className="back-btn" onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="cases-list">
                {visible.map(c => (
                  <CaseRow key={c.id} c={c} onClick={handleCaseClick} />
                ))}
              </div>
              {hasMore && (
                <button className="live-load-more" onClick={() => setPage(p => p + 1)}>
                  Show more ({(filtered.length - visible.length).toLocaleString()} remaining)
                </button>
              )}
            </>
          )
        ) : (
          grouped.map(group => (
            <section key={group.slug} className="issue-group">
              <div className="issue-group-header" style={{ '--accent': group.color }}>
                <span className="issue-group-dot" />
                <h2 className="issue-group-title">{group.title}</h2>
                <span className="issue-group-count">{group.cases.length} cases</span>
              </div>
              <div className="cases-list">
                {group.cases.slice(0, page * PAGE_SIZE).map(c => (
                  <CaseRow key={c.id} c={c} onClick={handleCaseClick} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className="footer">
        <p>Data is for informational purposes. Numbers are updated as cases progress.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
