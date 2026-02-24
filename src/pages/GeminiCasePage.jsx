import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JudgeLink from '../components/JudgeLink'
import { GEMINI_CASE, GENERATED_AT } from '../data/geminiCaseData'
import './CasePage.css'
import './GeminiCasePage.css'

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

const COURT_STATUS_LABEL = {
  'active':      'Active',
  'completed':   'Completed',
  'anticipated': 'Anticipated',
}

const TIER_TYPES = ['District Court', 'Court of Appeals', 'Supreme Court']

function CourtsTierTrack({ courts }) {
  const tiers = TIER_TYPES
    .map(type => courts.filter(c => c.type === type))
    .filter(t => t.length > 0)

  return (
    <div className="courts-tiers">
      {tiers.map((tier, ti) => (
        <div key={ti} className="courts-tier-wrap">
          {tier.length > 1 && <div className="courts-tier-bracket" />}
          <div className="courts-tier-row">
            {tier.map((c, ci) => (
              <div key={ci} className={`court-node court-node--${c.status}`}>
                <div className="court-node-name">{c.name}</div>
                <div className="court-node-type">{c.type}</div>
                <div className={`court-node-status court-status--${c.status}`}>
                  {COURT_STATUS_LABEL[c.status] ?? c.status}
                </div>
              </div>
            ))}
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
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function GeminiCasePage() {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [showAllDefendants, setShowAllDefendants] = useState(false)
  const c = GEMINI_CASE

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const keyEntries     = c.docketEntries.filter(e => e.isKey)
  const visibleEntries = showAll ? c.docketEntries : keyEntries

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/cases')}>← All Cases</button>
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="case-header">
        <div className="gemini-header-row">
          <div className="gemini-header-main">
            <div className="case-header-top">
              <h1 className="case-title">{c.case_name}</h1>
              <span className="status-badge badge-active">Active</span>
              <span className="gemini-ai-badge">
                <svg viewBox="0 0 16 16" fill="none" className="gemini-ai-icon">
                  <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                Gemini Analysis
              </span>
            </div>
            <div className="case-meta">
              <span>{c.court}</span>
              <span className="case-meta-divider">·</span>
              <span>Filed {formatDate(c.date_filed)}</span>
              {c.judge && (
                <>
                  <span className="case-meta-divider">·</span>
                  <span>Judge <JudgeLink names={c.judge} /></span>
                </>
              )}
            </div>
            <p className="case-description">{c.plaintiff_summary}</p>
          </div>
          {c.plaintiffs?.length > 0 && (
            <aside className="gemini-header-plaintiffs">
              <div className="ghp-label">Plaintiffs</div>
              {c.plaintiffs.map((p, i) => (
                <div key={i} className="ghp-name">
                  {p.wikipediaUrl
                    ? <a href={p.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="ghp-wiki">{p.name}</a>
                    : p.name}
                </div>
              ))}
            </aside>
          )}
        </div>
      </header>

      {/* ── Case Background ─────────────────────────────────── */}
      <section className="gemini-context-section">
        <h2 className="section-heading">Case Background</h2>
        <div className="gemini-context-card">
          <div className="gemini-context-row">
            <div className="gemini-context-label">Executive Action</div>
            <div className="gemini-context-date">{formatDate(c.executive_action_date)}</div>
            <p className="gemini-context-text">{c.executive_action_description}</p>
          </div>
          <div className="gemini-context-divider" />
          <div className="gemini-context-row">
            <div className="gemini-context-label">Constitutional Stakes</div>
            <p className="gemini-context-text">{c.constitutional_stakes}</p>
          </div>
          {c.currentStatus && (
            <>
              <div className="gemini-context-divider" />
              <div className="gemini-context-row">
                <div className="gemini-context-label">Current Status</div>
                <p className="gemini-context-text">{c.currentStatus}</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Parties: Plaintiffs and Defendants ───────────────── */}
      {(c.plaintiffs?.length > 0 || c.defendants?.length > 0) && (
        <section className="parties-section">
          <h2 className="section-heading">Parties</h2>
          <div className="parties-grid">
            {c.plaintiffs?.length > 0 && (
              <div className="parties-col">
                <div className="parties-col-label parties-col-label--plaintiff">Plaintiffs</div>
                <ul className="parties-list">
                  {c.plaintiffs.map((p, i) => (
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
              </div>
            )}
            {c.defendants?.length > 0 && (
              <div className="parties-col">
                <div className="parties-col-label parties-col-label--defendant">Defendants</div>
                <ul className="parties-list">
                  {(showAllDefendants ? c.defendants : c.defendants.slice(0, 3)).map((d, i) => (
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
                {c.defendants.length > 3 && (
                  <button
                    className="parties-show-more"
                    onClick={() => setShowAllDefendants(v => !v)}
                  >
                    {showAllDefendants
                      ? '▲ Show fewer'
                      : `▼ Show ${c.defendants.length - 3} more`}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Background News Articles ─────────────────────────── */}
      {c.backgroundArticles && c.backgroundArticles.length > 0 && (
        <section className="gemini-news-section">
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

      {/* ── Court progression ───────────────────────────────── */}
      {c.courts && c.courts.length > 0 && (
        <section className="courts-section">
          <h2 className="section-heading">Appeals Track</h2>
          <CourtsTierTrack courts={c.courts} />
        </section>
      )}

      {/* ── Timeline — key moments ───────────────────────────── */}
      {c.timeline.length > 0 && (
        <section className="timeline-section">
          <h2 className="section-heading">Key Moments</h2>
          <div className="timeline">
            {c.timeline.map((event, i) => {
              const cfg    = TYPE_CONFIG[event.type] || { label: event.type, color: 'rgba(255,255,255,0.3)' }
              const isLast = i === c.timeline.length - 1
              return (
                <div key={i} className={`timeline-item ${isLast ? 'timeline-item--last' : ''}`}>
                  <div className="timeline-left">
                    <div
                      className="timeline-dot"
                      style={{ background: cfg.color, boxShadow: `0 0 0 3px rgba(10,10,15,1), 0 0 0 4px ${cfg.color}40` }}
                    />
                    {!isLast && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date-row">
                      <span className="timeline-date">{formatDate(event.date)}</span>
                    </div>
                    <div className="timeline-event-header">
                      <span
                        className="timeline-type-badge"
                        style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}12` }}
                      >
                        {cfg.label}
                      </span>
                      <span className="timeline-event-title">{event.title}</span>
                    </div>
                    <p className="timeline-event-desc">{event.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Docket Entry Summaries: Key / All Actions ────────── */}
      <section className="actions-section">
        <div className="actions-header">
          <h2 className="section-heading">
            {showAll ? 'All Actions' : 'Key Actions'}
          </h2>
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
              <span className="toggle-seg-count">{c.docketEntries.length}</span>
            </button>
          </div>
        </div>

        <div className="actions-list">
          {visibleEntries.map((entry, i) => (
            <div key={i} className="action-row">
              <div className="action-row-top">
                <span className="action-date">{formatDate(entry.date)}</span>
                <span className="action-court">Entry #{entry.entryNumber}</span>
                {entry.isKey && (
                  <span className="gemini-key-badge">Key Action</span>
                )}
              </div>
              <p className="action-desc">{entry.summary}</p>
              {entry.pdfUrl && (
                <a
                  href={entry.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gemini-doc-link"
                >
                  <svg viewBox="0 0 14 14" fill="none" className="gemini-doc-icon">
                    <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M9 2v3h3M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  View Document
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          Analysis generated by Gemini AI on {new Date(GENERATED_AT).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          Summaries are AI-generated and may not fully capture legal nuances — verify against original court records.
        </p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
