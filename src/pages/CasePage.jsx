import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { CASES_BY_ID } from '../data/issues'
import { ABUSES_BY_CASE } from '../data/abuses'
import './CasePage.css'

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

  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  const smsHref   = `sms:?body=${encodeURIComponent(`${text}\n${url}`)}`
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
  'ruling-for':     { label: 'Ruling',       color: '#2a9d8f' },
  'ruling-against': { label: 'Ruling',       color: '#e63946' },
  'appeal':         { label: 'Appeal',       color: '#c77dff' },
  'dismissed':      { label: 'Dismissed',    color: 'rgba(255,255,255,0.35)' },
}

const STATUS_CONFIG = {
  'active':         { label: 'Active',           cls: 'badge-active' },
  'injunction':     { label: 'Injunction',       cls: 'badge-injunction' },
  'closed-for':     { label: 'Closed — For',     cls: 'badge-closed-for' },
  'closed-against': { label: 'Closed — Against', cls: 'badge-closed-against' },
}

const COURT_STATUS_LABEL = {
  'active':      'Active',
  'completed':   'Completed',
  'anticipated': 'Anticipated',
}

// Ordered list of tier types for the appeals track
const TIER_TYPES = ['District Court', 'Court of Appeals', 'Supreme Court']

function CourtsTierTrack({ courts }) {
  // Group courts into tiers in the correct order; drop empty tiers
  const tiers = TIER_TYPES
    .map(type => courts.filter(c => c.type === type))
    .filter(t => t.length > 0)

  return (
    <div className="courts-tiers">
      {tiers.map((tier, ti) => (
        <div key={ti} className="courts-tier-wrap">
          {/* Bracket line when tier has multiple courts */}
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
              <svg viewBox="0 0 8 28" fill="none">
                <path d="M4 0v22M1 18l3 6 3-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function CasePage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const caseData = CASES_BY_ID[caseId]
  const [showAll, setShowAll] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [caseId])

  if (!caseData) {
    return (
      <div className="app">
        <div className="bg-gradient" />
        <NavBar />
        <div className="issue-not-found">
          <p>Case not found.</p>
          <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    )
  }

  const statusCfg  = STATUS_CONFIG[caseData.status] || { label: caseData.status, cls: 'badge-active' }
  const timeline   = caseData.timeline ?? []
  const courts     = caseData.courts   ?? []
  const abuses     = ABUSES_BY_CASE[caseId] ?? []
  const keyActions = timeline.filter(e => e.key)
  const visibleActions = showAll ? timeline : keyActions

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate(`/issue/${caseData.issueSlug}`)}>
          ← {caseData.issueTitle}
        </button>
      </div>

      {/* Case header */}
      <header className="case-header">
        <div className="case-header-top">
          <h1 className="case-title">{caseData.name}</h1>
          <span className={`status-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
          <ShareWidget caseData={caseData} />
        </div>
        <div className="case-meta">
          <span>{caseData.court}</span>
          <span className="case-meta-divider">·</span>
          <span>Filed {formatDate(caseData.dateFiled)}</span>
          <span className="case-meta-divider">·</span>
          <span className="case-id">{caseData.id}</span>
        </div>
        <p className="case-description">{caseData.description}</p>
      </header>

      {/* Court progression */}
      {courts.length > 0 && (
        <section className="courts-section">
          <h2 className="section-heading">Appeals Track</h2>
          <CourtsTierTrack courts={courts} />
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="timeline-section">
          <h2 className="section-heading">Timeline</h2>
          <div className="timeline">
            {timeline.map((event, i) => {
              const cfg   = TYPE_CONFIG[event.type] || { label: event.type, color: 'rgba(255,255,255,0.3)' }
              const isLast = i === timeline.length - 1
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
                      {event.court && (
                        <span className="timeline-court">{event.court}</span>
                      )}
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

      {/* Key actions list */}
      {timeline.length > 0 && (
        <section className="actions-section">
          <div className="actions-header">
            <h2 className="section-heading">
              {showAll ? 'All Actions' : 'Key Actions'}
            </h2>
            {timeline.length > keyActions.length && (
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
                  <span className="toggle-seg-count">{timeline.length}</span>
                </button>
              </div>
            )}
          </div>

          <div className="actions-list">
            {visibleActions.map((event, i) => {
              const cfg = TYPE_CONFIG[event.type] || { label: event.type, color: 'rgba(255,255,255,0.3)' }
              return (
                <div key={i} className="action-row">
                  <div className="action-row-top">
                    <span className="action-date">{formatDate(event.date)}</span>
                    <span
                      className="action-type-badge"
                      style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}12` }}
                    >
                      {cfg.label}
                    </span>
                    {event.court && (
                      <span className="action-court">{event.court}</span>
                    )}
                  </div>
                  <div className="action-title">{event.title}</div>
                  <p className="action-desc">{event.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Before the Courts Intervened */}
      {abuses.length > 0 && (
        <section className="abuses-section">
          <div className="abuses-header">
            <div className="abuses-header-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 8v4M10 14.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="section-heading abuses-section-heading">Before the Courts Intervened</h2>
              <p className="abuses-intro">
                Actions the administration took before judges had a chance to rule — often creating
                facts on the ground that courts could not fully undo.
              </p>
            </div>
          </div>

          <div className="abuses-list">
            {abuses.map((abuse, i) => (
              <div key={i} className={`abuse-card abuse-card--${abuse.type}`}>
                <div className="abuse-card-top">
                  <span className="abuse-date">{formatDate(abuse.date)}</span>
                  <span className={`abuse-type-badge abuse-type--${abuse.type}`}>
                    {abuse.type === 'defied-order' ? 'Defied Court Order' : 'Before Court Could Act'}
                  </span>
                </div>
                <div className="abuse-title">{abuse.title}</div>
                <p className="abuse-desc">{abuse.description}</p>
                {abuse.sources.length > 0 && (
                  <div className="abuse-sources">
                    {abuse.sources.map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`abuse-source-link abuse-source--${src.type}`}
                      >
                        {src.type === 'video' && (
                          <svg viewBox="0 0 16 16" fill="none" className="source-icon">
                            <polygon points="4,2 14,8 4,14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {src.type === 'article' && (
                          <svg viewBox="0 0 16 16" fill="none" className="source-icon">
                            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        )}
                        {src.type === 'social' && (
                          <svg viewBox="0 0 16 16" fill="none" className="source-icon">
                            <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M6 7l4-3M6 9l4 3" stroke="currentColor" strokeWidth="1.2"/>
                          </svg>
                        )}
                        {src.type === 'document' && (
                          <svg viewBox="0 0 16 16" fill="none" className="source-icon">
                            <path d="M4 2h5l4 4v8H4V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.2"/>
                          </svg>
                        )}
                        {src.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <p>Data is for informational purposes. Timeline events are based on publicly available court records.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>

      <div className="bottom-banner">
        A project of the Notre Dame Kellogg Institute
      </div>
    </div>
  )
}
