import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { JUDGES_DATA } from '../data/judgesData'
import './JudgePage.css'

const CURRENT_YEAR = new Date().getFullYear()

function fmtDate(str) {
  if (!str) return null
  // Some FJC dates are just years ("2007") — return as-is
  if (/^\d{4}$/.test(str.trim())) return str.trim()
  const parts = str.split('-')
  if (parts.length < 3) return str
  const [y, m, d] = parts
  try {
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return str
  }
}

function getYear(dateStr) {
  if (!dateStr) return null
  return dateStr.split('-')[0] || dateStr.trim()
}

function partyColor(party) {
  if (party === 'Democratic') return '#457b9d'
  if (party === 'Republican') return '#e63946'
  return '#888'
}

function abaColor(rating) {
  if (!rating) return '#888'
  const r = rating.toLowerCase()
  if (r.includes('well qualified')) return '#2a9d8f'
  if (r === 'qualified')            return '#f4a261'
  if (r.includes('not qualified'))  return '#e63946'
  return '#888'
}

function statusOf(appts) {
  if (!appts.length) return 'Unknown'
  const last = appts[appts.length - 1]
  if (last.terminationDate || last.termination) return 'Terminated'
  if (last.seniorStatusDate) return 'Senior Status'
  return 'Active'
}

function yearsServed(commissionDate, terminationDate) {
  const start = parseInt(getYear(commissionDate), 10)
  if (isNaN(start)) return null
  const end = terminationDate ? parseInt(getYear(terminationDate), 10) : CURRENT_YEAR
  return end - start
}

// ── Components ────────────────────────────────────────────────────────────────

function ABABadge({ rating }) {
  const color = abaColor(rating)
  const label = rating || 'Not Rated'
  return (
    <span className="judge-aba-badge" style={{ '--aba-color': color }}>
      ABA: {label}
    </span>
  )
}

function PartyPill({ party }) {
  if (!party) return null
  const color = partyColor(party)
  return (
    <span className="judge-party-pill" style={{ '--party-color': color }}>
      <span className="judge-party-dot" />
      {party} Appointee
    </span>
  )
}

function StatusChip({ status }) {
  const cls = {
    'Active':        'judge-status--active',
    'Senior Status': 'judge-status--senior',
    'Terminated':    'judge-status--terminated',
  }[status] ?? 'judge-status--unknown'
  return <span className={`judge-status-chip ${cls}`}>{status}</span>
}

function VoteLabel({ appt }) {
  if (!appt.senateVoteType) return null
  const voteType = appt.senateVoteType
  const ayesNays = appt.ayesNays
  if (ayesNays) return <>{voteType} vote · {ayesNays}</>
  return <>{voteType} vote</>
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function JudgePage() {
  const { jid }  = useParams()
  const navigate = useNavigate()
  const judge    = JUDGES_DATA[jid]

  useEffect(() => { window.scrollTo(0, 0) }, [jid])

  // ── Not found ────────────────────────────────────────────────────────────
  if (!judge) {
    return (
      <div className="app">
        <div className="bg-gradient" />
        <NavBar />
        <div className="judge-not-found">
          <div className="judge-not-found-card">
            <h2 className="judge-not-found-title">Judge data not available</h2>
            <p className="judge-not-found-sub">No FJC record found for ID: {jid}</p>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>
      </div>
    )
  }

  const fullName   = [judge.firstName, judge.middleName, judge.lastName, judge.suffix]
    .filter(Boolean).join(' ')
  const appts      = judge.appointments ?? []
  const lastAppt   = appts[appts.length - 1] ?? {}
  const status     = statusOf(appts)
  const party      = lastAppt.party ?? ''
  const commYear   = getYear(lastAppt.commissionDate)
  const termYear   = getYear(lastAppt.terminationDate)
  const yrs        = yearsServed(lastAppt.commissionDate, lastAppt.terminationDate)

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="judge-header">
        <h1 className="judge-name">{fullName}</h1>
        <div className="judge-header-chips">
          <StatusChip status={status} />
          <PartyPill party={party} />
        </div>
        {judge.gender && (
          <p className="judge-meta-line">
            {judge.gender}
            {judge.race ? ` · ${judge.race}` : ''}
          </p>
        )}
      </header>

      {/* ── Current Appointment Card ───────────────────────────────────── */}
      {lastAppt.courtName && (
        <section className="judge-section">
          <h2 className="section-heading">Current Appointment</h2>
          <div className="judge-card">
            <div className="judge-card-court">{lastAppt.courtName}</div>
            {lastAppt.title && (
              <div className="judge-card-role">{lastAppt.title}</div>
            )}

            <div className="judge-card-meta-row">
              {lastAppt.appointingPresident && (
                <span className="judge-card-president">
                  Appointed by {lastAppt.appointingPresident}
                </span>
              )}
              {commYear && (
                <span className="judge-card-service">
                  {status === 'Terminated'
                    ? `Served ${commYear}–${termYear ?? '?'}`
                    : `Serving since ${commYear}`}
                  {yrs !== null && status !== 'Terminated'
                    ? ` (${yrs} yr${yrs !== 1 ? 's' : ''})`
                    : null}
                </span>
              )}
            </div>

            <div className="judge-card-badges">
              <ABABadge rating={lastAppt.abaRating} />
              {lastAppt.senateVoteType && (
                <span className="judge-vote-badge">
                  <VoteLabel appt={lastAppt} />
                </span>
              )}
            </div>

            {lastAppt.confirmationDate && (
              <div className="judge-card-dates">
                {lastAppt.nominationDate && (
                  <span>Nominated {fmtDate(lastAppt.nominationDate)}</span>
                )}
                <span>Confirmed {fmtDate(lastAppt.confirmationDate)}</span>
                {lastAppt.commissionDate && (
                  <span>Commissioned {fmtDate(lastAppt.commissionDate)}</span>
                )}
              </div>
            )}

            {lastAppt.chiefJudgeBegin && (
              <div className="judge-card-chief">
                Chief Judge: {fmtDate(lastAppt.chiefJudgeBegin)}
                {lastAppt.chiefJudgeEnd
                  ? ` – ${fmtDate(lastAppt.chiefJudgeEnd)}`
                  : ' – present'}
              </div>
            )}

            {lastAppt.seniorStatusDate && (
              <div className="judge-card-senior">
                Senior status since {fmtDate(lastAppt.seniorStatusDate)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Career Timeline (shown when >1 appointment) ────────────────── */}
      {appts.length > 1 && (
        <section className="judge-section">
          <h2 className="section-heading">Career Timeline</h2>
          <div className="judge-timeline">
            {appts.map((a, i) => {
              const aStart  = getYear(a.commissionDate) ?? '?'
              const aEnd    = a.terminationDate
                ? getYear(a.terminationDate)
                : (i === appts.length - 1 ? 'present' : '?')
              const aParty  = partyColor(a.party)
              const isLast  = i === appts.length - 1
              return (
                <div key={i} className={`judge-timeline-item${isLast ? ' judge-timeline-item--last' : ''}`}>
                  <div className="judge-timeline-track">
                    <div className="judge-timeline-dot" style={{ '--appt-color': aParty }} />
                    {!isLast && <div className="judge-timeline-line" />}
                  </div>
                  <div className="judge-timeline-body">
                    <div className="judge-timeline-years">{aStart} – {aEnd}</div>
                    <div className="judge-timeline-role">
                      {a.title}
                      {a.courtName ? `, ${a.courtName}` : ''}
                    </div>
                    <div className="judge-timeline-detail">
                      {a.appointingPresident && (
                        <span>
                          {a.appointingPresident}
                          {a.party && (
                            <span style={{ color: aParty }}> · {a.party[0]}</span>
                          )}
                        </span>
                      )}
                      {(a.abaRating || a.ayesNays) && (
                        <span className="judge-timeline-aba">
                          {a.abaRating ? `ABA: ${a.abaRating}` : ''}
                          {a.ayesNays ? ` · ${a.ayesNays}${a.senateVoteType ? ` (${a.senateVoteType})` : ''}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Education ─────────────────────────────────────────────────── */}
      {judge.education?.length > 0 && (
        <section className="judge-section">
          <h2 className="section-heading">Education</h2>
          <ul className="judge-education-list">
            {judge.education.map((ed, i) => (
              <li key={i} className="judge-education-item">
                <span className="judge-ed-school">{ed.school}</span>
                {(ed.degree || ed.year) && (
                  <span className="judge-ed-meta">
                    {ed.degree}{ed.degree && ed.year ? ', ' : ''}{ed.year}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Other Federal Service ──────────────────────────────────────── */}
      {judge.otherFederalService?.length > 0 && (
        <section className="judge-section">
          <h2 className="section-heading">Other Federal Service</h2>
          <ul className="judge-service-list">
            {judge.otherFederalService.map((s, i) => (
              <li key={i} className="judge-service-item">{s}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="footer">
        <p>
          Judge data sourced from the{' '}
          <a
            href="https://www.fjc.gov/history/judges/biographical-database-article-iii-federal-judges"
            target="_blank"
            rel="noopener noreferrer"
          >
            FJC Biographical Database of Article III Federal Judges
          </a>.
        </p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
