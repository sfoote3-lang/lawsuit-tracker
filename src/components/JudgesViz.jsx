import { useRef, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { JUDICIAL_RULINGS, RULING_STATS } from '../data/judges'
import './JudgesViz.css'

// Deterministic scatter positions within a bounded area
// Uses sine/cosine of the index to spread dots organically
function buildPositions(rulings) {
  const against = rulings.filter(r => r.ruling === 'against')
  const forAdmin = rulings.filter(r => r.ruling === 'for')

  const pos = {}

  // Initial: tight circle around center
  rulings.forEach((r, i) => {
    const angle  = (i / rulings.length) * 2 * Math.PI
    const radius = 2.5 + (i % 3) * 1.5
    pos[r.id] = {
      init: { left: 50 + Math.cos(angle) * radius, top: 50 + Math.sin(angle) * radius },
      final: null,
    }
  })

  // Final: against = left zone (3%–42%), for = right zone (57%–95%)
  // Both groups use the same vertical span so they appear centered together
  const COLS_AGAINST = 6
  against.forEach((r, i) => {
    const col      = i % COLS_AGAINST
    const row      = Math.floor(i / COLS_AGAINST)
    const totRows  = Math.ceil(against.length / COLS_AGAINST)
    pos[r.id].final = {
      left: 4  + (col / (COLS_AGAINST - 1)) * 36 + Math.sin(i * 2.1) * 1.8,
      top:  10 + (row / Math.max(totRows - 1, 1)) * 78 + Math.cos(i * 1.7) * 2.5,
    }
  })

  const COLS_FOR = 3
  forAdmin.forEach((r, i) => {
    const col     = i % COLS_FOR
    const row     = Math.floor(i / COLS_FOR)
    const totRows = Math.ceil(forAdmin.length / COLS_FOR)
    pos[r.id].final = {
      left: 58 + (col / Math.max(COLS_FOR - 1, 1)) * 35 + Math.sin(i * 2.4) * 2,
      top:  10 + (row / Math.max(totRows - 1, 1)) * 78 + Math.cos(i * 1.9) * 3,
    }
  })

  return pos
}

export default function JudgesViz() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [revealed, setRevealed]   = useState(false)
  const [hovered,  setHovered]    = useState(null)

  const positions = useMemo(() => buildPositions(JUDICIAL_RULINGS), [])

  // Trigger split when the section scrolls into view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { totalAgainst, totalFor, demAgainst, demFor, repAgainst, repFor } = RULING_STATS

  return (
    <section className="judges-section">
      <h2 className="stats-heading">The Judiciary: How Judges Are Ruling</h2>
      <p className="judges-subtitle">
        Each dot is a ruling in a tracked case — colored by the appointing president's party.
        Watch them sort as the section loads.
      </p>

      {/* ── Dot visualization ─────────────────────────────── */}
      <div className={`judges-stage ${revealed ? 'judges-stage--revealed' : ''}`} ref={containerRef}>

        {/* Column labels */}
        <div className="judges-col-labels">
          <div className={`judges-col-label judges-col-label--against ${revealed ? 'visible' : ''}`}>
            <span className="judges-col-count">{totalAgainst}</span>
            <span className="judges-col-name">Ruled Against</span>
          </div>
          <div className={`judges-col-label judges-col-label--for ${revealed ? 'visible' : ''}`}>
            <span className="judges-col-count">{totalFor}</span>
            <span className="judges-col-name">Ruled For Admin</span>
          </div>
        </div>

        {/* Dot field */}
        <div className="judges-field">
          {/* Center divider — appears on reveal */}
          <div className={`judges-divider ${revealed ? 'visible' : ''}`} />

          {JUDICIAL_RULINGS.map((r, i) => {
            const p   = positions[r.id]
            const pos = revealed ? p.final : p.init
            const isHovered = hovered === r.id

            return (
              <div
                key={r.id}
                className={`judge-dot judge-dot--${r.party.toLowerCase()} ${revealed ? 'judge-dot--placed' : ''}`}
                style={{
                  left:            `${pos.left}%`,
                  top:             `${pos.top}%`,
                  transitionDelay: revealed ? `${i * 0.018}s` : '0s',
                  zIndex:          isHovered ? 10 : 1,
                }}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/cases?court=${encodeURIComponent(r.court)}`)}
              >
                {isHovered && (
                  <div className="dot-tooltip">
                    <div className="dot-tt-party">
                      {r.party === 'D' ? 'Democratic appointee' : 'Republican appointee'}
                    </div>
                    <div className="dot-tt-court">{r.court}</div>
                    <div className="dot-tt-note">{r.note}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Breakdown stats ───────────────────────────────── */}
      <div className={`judges-breakdown ${revealed ? 'visible' : ''}`}>
        <div className="breakdown-group breakdown-group--against">
          <div className="breakdown-label">Against Administration</div>
          <div className="breakdown-rows">
            <div className="breakdown-row">
              <span className="bd-dot bd-dot--dem" />
              <span className="bd-party">Democratic appointees</span>
              <strong className="bd-count">{demAgainst}</strong>
            </div>
            <div className="breakdown-row">
              <span className="bd-dot bd-dot--rep" />
              <span className="bd-party">Republican appointees</span>
              <strong className="bd-count">{repAgainst}</strong>
            </div>
          </div>
        </div>

        <div className="breakdown-divider" />

        <div className="breakdown-group breakdown-group--for">
          <div className="breakdown-label">For Administration</div>
          <div className="breakdown-rows">
            <div className="breakdown-row">
              <span className="bd-dot bd-dot--rep" />
              <span className="bd-party">Republican appointees</span>
              <strong className="bd-count">{repFor}</strong>
            </div>
            <div className="breakdown-row">
              <span className="bd-dot bd-dot--dem" />
              <span className="bd-party">Democratic appointees</span>
              <strong className="bd-count">{demFor}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="judges-legend">
        <span className="jl-item">
          <span className="jl-dot jl-dot--dem" />
          Democratic appointee
        </span>
        <span className="jl-item">
          <span className="jl-dot jl-dot--rep" />
          Republican appointee
        </span>
        <span className="jl-note">
          Hover for details · Click to filter cases by court · Data is representative; verify against court records
        </span>
      </div>
    </section>
  )
}
