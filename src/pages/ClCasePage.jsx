import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JudgeLink from '../components/JudgeLink'
import { useOneDocket } from '../hooks/useOneDocket'
import { courtName } from '../data/courtlistenerConfig'
import { courtListenerUrl, pacerSearchUrl } from '../data/sheetsConfig'
import './CasePage.css'
import './ClCasePage.css'

// ── Share widget (same as CasePage) ──────────────────────────────────────────
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, handler])
}

function ShareWidget({ title, court }) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)
  useOutsideClick(ref, useCallback(() => setOpen(false), []))

  const url     = window.location.href
  const fullTitle = `${title} | Legal Challenges Tracker`
  const text    = `Track this case: ${title} — ${court}`

  function handleClick() {
    if (navigator.share) navigator.share({ title: fullTitle, text, url }).catch(() => {})
    else setOpen(o => !o)
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const emailHref   = `mailto:?subject=${encodeURIComponent(fullTitle)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

  return (
    <div className="share-wrap" ref={ref}>
      <button className={`share-btn ${open ? 'share-btn--open' : ''}`} onClick={handleClick} aria-label="Share">
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
            <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
              <rect x="5" y="2" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 5H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
          <a className="share-option" href={emailHref} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" fill="none" className="share-option-icon">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 5.5l6.3 4.5a1 1 0 001.4 0L15 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>Email</span>
          </a>
          <a className="share-option" href={twitterHref} target="_blank" rel="noopener noreferrer">
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function inferCourtType(courtId) {
  if (!courtId) return 'District Court'
  if (/^ca\d+$|^cadc$|^cafc$/.test(courtId)) return 'Court of Appeals'
  if (courtId === 'scotus') return 'Supreme Court'
  return 'District Court'
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="cl-loading">
      <div className="cl-skeleton cl-skeleton--title" />
      <div className="cl-skeleton cl-skeleton--meta" />
      <div className="cl-skeleton cl-skeleton--desc" />
      <div className="cl-skeleton cl-skeleton--desc" style={{ width: '70%' }} />
      <div className="cl-loading-label">Loading case data from CourtListener…</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClCasePage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const docketNumber = params.get('n') ?? ''

  const { data, loading, error } = useOneDocket(docketNumber)

  useEffect(() => { window.scrollTo(0, 0) }, [docketNumber])

  // ── Not-found / bad URL ───────────────────────────────────────────────────
  if (!docketNumber) {
    return (
      <div className="app">
        <div className="bg-gradient" />
        <NavBar />
        <div className="issue-not-found">
          <p>No docket number specified.</p>
          <button className="back-btn" onClick={() => navigate('/cases')}>← All Cases</button>
        </div>
      </div>
    )
  }

  // ── Derived values from CourtListener data ────────────────────────────────
  const caseName     = data?.case_name        ?? docketNumber
  // Prefer the search API's pre-formatted citation string, fall back to courtName()
  const courtDisplay = data?.court_citation   ?? courtName(data?.court_id) ?? '—'
  const dateFiled    = data?.date_filed       ?? null
  const dateTerminated = data?.date_terminated ?? null
  const isTerminated = !!dateTerminated
  const natureOfSuit = data?.nature_of_suit   ?? null
  const cause        = data?.cause            ?? null
  const juryDemand   = data?.jury_demand      ?? null
  const jurisdType   = data?.jurisdiction_type ?? null
  const assignedTo   = data?.assigned_to_str  ?? null
  const referredTo   = data?.referred_to_str  ?? null
  const parties      = data?.parties          ?? []
  const clDocketUrl  = data?.docket_absolute_url
    ? `https://www.courtlistener.com${data.docket_absolute_url}`
    : courtListenerUrl(docketNumber)
  const courtType    = inferCourtType(data?.court_id)

  // Status badge
  const statusCls   = isTerminated ? 'badge-closed-for' : 'badge-active'
  const statusLabel = isTerminated ? 'Terminated' : 'Active'

  // Build a minimal description from API fields
  const descParts = []
  if (natureOfSuit) descParts.push(`Nature of suit: ${natureOfSuit}.`)
  if (cause)        descParts.push(`Cause of action: ${cause}.`)
  if (!descParts.length && courtDisplay) descParts.push(`Federal case in ${courtDisplay}.`)
  const description = descParts.join(' ')

  // Minimal single-event timeline (just filing)
  const filingEvent = dateFiled
    ? { date: dateFiled, court: courtDisplay, type: 'filed', title: 'Case Filed', key: true }
    : null

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/cases')}>← All Cases</button>
      </div>

      {/* ── Case header ──────────────────────────────────────────── */}
      <header className="case-header">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="cl-error-block">
            <p className="cl-error-msg">{error}</p>
            <div className="cl-error-links">
              <a href={clDocketUrl} target="_blank" rel="noopener noreferrer" className="live-docket-link">
                Search CourtListener →
              </a>
              <a href={pacerSearchUrl(docketNumber)} target="_blank" rel="noopener noreferrer" className="live-docket-link">
                Search PACER →
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="case-header-top">
              <h1 className="case-title">{caseName}</h1>
              <span className={`status-badge ${statusCls}`}>{statusLabel}</span>
              <ShareWidget title={caseName} court={courtDisplay} />
            </div>

            <div className="case-meta">
              <span>{courtDisplay}</span>
              {dateFiled && (
                <>
                  <span className="case-meta-divider">·</span>
                  <span>Filed {fmtDate(dateFiled)}</span>
                </>
              )}
              {dateTerminated && (
                <>
                  <span className="case-meta-divider">·</span>
                  <span>Terminated {fmtDate(dateTerminated)}</span>
                </>
              )}
              <span className="case-meta-divider">·</span>
              <span className="case-id">{docketNumber}</span>
            </div>

            <p className="case-description">{description}</p>

            {/* Extra metadata tags */}
            <div className="cl-meta-tags">
              {natureOfSuit && (
                <span className="cl-tag cl-tag--suit">{natureOfSuit}</span>
              )}
              {cause && (
                <span className="cl-tag cl-tag--cause">{cause}</span>
              )}
              {jurisdType && (
                <span className="cl-tag cl-tag--juris">{jurisdType}</span>
              )}
              {juryDemand && juryDemand !== 'None' && (
                <span className="cl-tag cl-tag--jury">Jury: {juryDemand}</span>
              )}
            </div>

            {/* Assigned judge */}
            {(assignedTo || referredTo) && (
              <div className="cl-judges">
                {assignedTo && (
                  <span className="cl-judge">
                    <span className="cl-judge-label">Assigned to</span>
                    <JudgeLink names={assignedTo} />
                  </span>
                )}
                {referredTo && (
                  <span className="cl-judge">
                    <span className="cl-judge-label">Referred to</span>
                    <JudgeLink names={referredTo} />
                  </span>
                )}
              </div>
            )}

            {/* Parties */}
            {parties.length > 0 && (
              <div className="cl-parties">
                <span className="cl-judge-label">Parties</span>
                <span className="cl-parties-list">{parties.join(' · ')}</span>
              </div>
            )}
          </>
        )}
      </header>

      {/* ── Appeals track (filing court only) ────────────────────── */}
      {!loading && !error && courtDisplay && (
        <section className="courts-section">
          <h2 className="section-heading">Court</h2>
          <div className="courts-tiers">
            <div className="courts-tier-wrap">
              <div className="courts-tier-row">
                <div className={`court-node court-node--${isTerminated ? 'completed' : 'active'}`}>
                  <div className="court-node-name">{courtDisplay}</div>
                  <div className="court-node-type">{courtType}</div>
                  <div className={`court-node-status court-status--${isTerminated ? 'completed' : 'active'}`}>
                    {isTerminated ? 'Completed' : 'Active'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Minimal timeline (filed event) ───────────────────────── */}
      {!loading && !error && filingEvent && (
        <section className="timeline-section">
          <h2 className="section-heading">Timeline</h2>
          <div className="timeline">
            <div className="timeline-item timeline-item--last">
              <div className="timeline-left">
                <div
                  className="timeline-dot"
                  style={{ background: '#457b9d', boxShadow: '0 0 0 3px rgba(10,10,15,1), 0 0 0 4px #457b9d40' }}
                />
              </div>
              <div className="timeline-content">
                <div className="timeline-date-row">
                  <span className="timeline-date">{fmtDate(filingEvent.date)}</span>
                  <span className="timeline-court">{filingEvent.court}</span>
                </div>
                <div className="timeline-event-header">
                  <span
                    className="timeline-type-badge"
                    style={{ color: '#457b9d', borderColor: '#457b9d40', background: '#457b9d12' }}
                  >
                    Filed
                  </span>
                  <span className="timeline-event-title">Case Filed</span>
                </div>
                <p className="timeline-event-desc">
                  Case filed in {courtDisplay}. Docket number: {docketNumber}.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Needs curation notice ─────────────────────────────────── */}
      {!loading && !error && (
        <section className="cl-curation-section">
          <div className="cl-curation-header">
            <div className="cl-curation-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4.5M10 13v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="section-heading cl-curation-heading">About this page</h2>
              <p className="cl-curation-intro">
                This page was auto-generated from public CourtListener docket data. The fields below
                are filled from the API. A fully curated case page also includes a detailed description,
                complete timeline, court progression, and "Before the Courts Intervened" analysis.
              </p>
            </div>
          </div>

          <div className="cl-curation-grid">
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Case Name</div>
              <div className="cl-field-value">{caseName}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Filing Court</div>
              <div className="cl-field-value">{courtDisplay || '—'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Date Filed</div>
              <div className="cl-field-value">{fmtDate(dateFiled) ?? '—'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Date Terminated</div>
              <div className="cl-field-value">{fmtDate(dateTerminated) ?? 'Ongoing'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Nature of Suit</div>
              <div className="cl-field-value">{natureOfSuit ?? '—'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Cause of Action</div>
              <div className="cl-field-value">{cause ?? '—'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Jurisdiction</div>
              <div className="cl-field-value">{jurisdType ?? '—'}</div>
            </div>
            <div className="cl-field cl-field--filled">
              <div className="cl-field-label">Jury Demand</div>
              <div className="cl-field-value">{juryDemand ?? '—'}</div>
            </div>
            <div className="cl-field cl-field--missing">
              <div className="cl-field-label">Status</div>
              <div className="cl-field-value cl-field-value--missing">Needs review — active / injunction / closed-for / closed-against?</div>
            </div>
            <div className="cl-field cl-field--missing">
              <div className="cl-field-label">Issue Category</div>
              <div className="cl-field-value cl-field-value--missing">Which of the 8 issue areas?</div>
            </div>
            <div className="cl-field cl-field--missing cl-field--wide">
              <div className="cl-field-label">Description</div>
              <div className="cl-field-value cl-field-value--missing">1–2 sentence plain-language summary needed</div>
            </div>
            <div className="cl-field cl-field--missing cl-field--wide">
              <div className="cl-field-label">Timeline events</div>
              <div className="cl-field-value cl-field-value--missing">TROs, injunctions, rulings, appeals — need dates + descriptions</div>
            </div>
            <div className="cl-field cl-field--missing cl-field--wide">
              <div className="cl-field-label">Court progression</div>
              <div className="cl-field-value cl-field-value--missing">Has this moved to a circuit court or SCOTUS?</div>
            </div>
          </div>

          <div className="cl-curation-links">
            <a
              href={clDocketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cl-ext-btn"
            >
              View full docket on CourtListener →
            </a>
            <a
              href={pacerSearchUrl(docketNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="cl-ext-btn cl-ext-btn--secondary"
            >
              Search PACER →
            </a>
          </div>
        </section>
      )}

      <footer className="footer">
        <p>Data sourced from CourtListener (Free Law Project). For informational purposes only.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
