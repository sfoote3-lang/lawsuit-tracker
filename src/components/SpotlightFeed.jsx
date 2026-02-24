import { useNavigate } from 'react-router-dom'
import { SPOTLIGHT_ABUSES } from '../data/abuses'
import { CASES_BY_ID } from '../data/issues'
import './SpotlightFeed.css'

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function SourceIcon({ type }) {
  if (type === 'video') return (
    <svg viewBox="0 0 16 16" fill="none" className="sf-source-icon">
      <polygon points="4,2 14,8 4,14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
  if (type === 'social') return (
    <svg viewBox="0 0 16 16" fill="none" className="sf-source-icon">
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 7l4-3M6 9l4 3" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
  // article / document
  return (
    <svg viewBox="0 0 16 16" fill="none" className="sf-source-icon">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function SpotlightFeed() {
  const navigate = useNavigate()

  if (SPOTLIGHT_ABUSES.length === 0) return null

  return (
    <section className="spotlight-section">
      <div className="spotlight-header">
        <div className="spotlight-header-left">
          <div className="spotlight-eyebrow">
            <div className="spotlight-pulse" />
            Spotlight
          </div>
          <h2 className="stats-heading spotlight-heading">Before the Courts Intervened</h2>
          <p className="spotlight-subtitle">
            Actions the administration took before any judge could rule — often creating
            irreversible facts on the ground.
          </p>
        </div>
      </div>

      <div className="spotlight-grid">
        {SPOTLIGHT_ABUSES.map((abuse, i) => {
          const caseData = CASES_BY_ID[abuse.caseId]
          if (!caseData) return null
          const isDefied = abuse.type === 'defied-order'

          return (
            <div
              key={i}
              className={`sf-card sf-card--${abuse.type}`}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/case/${abuse.caseId}#abuses`)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/case/${abuse.caseId}#abuses`)}
            >
              {/* Card accent bar */}
              <div className={`sf-card-accent sf-accent--${abuse.type}`} />

              <div className="sf-card-body">
                {/* Top row: date + badge */}
                <div className="sf-card-top">
                  <span className="sf-date">{formatDate(abuse.date)}</span>
                  <span className={`sf-type-badge sf-type--${abuse.type}`}>
                    {isDefied ? 'Defied Court Order' : 'Before Court Could Act'}
                  </span>
                </div>

                {/* Title */}
                <div className="sf-title">{abuse.title}</div>

                {/* Description — truncated */}
                <p className="sf-desc">
                  {abuse.description.length > 200
                    ? abuse.description.slice(0, 200).trimEnd() + '…'
                    : abuse.description}
                </p>

                {/* Source links */}
                {abuse.sources.length > 0 && (
                  <div className="sf-sources" onClick={e => e.stopPropagation()}>
                    {abuse.sources.slice(0, 3).map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`sf-source sf-source--${src.type}`}
                      >
                        <SourceIcon type={src.type} />
                        {src.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Footer: case link */}
                <div className="sf-card-footer">
                  <div className="sf-case-pill" style={{ background: `${caseData.issueColor}18`, borderColor: `${caseData.issueColor}30` }}>
                    <span className="sf-case-dot" style={{ background: caseData.issueColor }} />
                    <span className="sf-case-name">{caseData.name}</span>
                  </div>
                  <span className="sf-view-arrow">View case →</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
