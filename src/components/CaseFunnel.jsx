import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './CaseFunnel.css'

// ─── UPDATE THESE NUMBERS WITH REAL DATA ──────────────────────────────────
const FUNNEL_STATS = {
  total:          500,   // all cases filed
  appellate:      127,   // reached a circuit court of appeals
  scotus:          23,   // petitioned the Supreme Court
  scotusFor:        8,   // SCOTUS ruled for the administration
  scotusAgainst:    5,   // SCOTUS ruled against the administration
  // remainder (scotus - scotusFor - scotusAgainst) are pending
}
// ──────────────────────────────────────────────────────────────────────────

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

function useCountUp(target, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0)
  const triggered = useRef(false)
  const ref = useRef(null)

  const start = useCallback(() => {
    if (triggered.current) return
    triggered.current = true
    const startTime = performance.now() + delay
    const tick = (now) => {
      if (now < startTime) { requestAnimationFrame(tick); return }
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOutCubic(t) * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, delay])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { start(); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [start])

  return [value, ref]
}

function Stage({ number, label, sublabel, pct, color, delay = 0, highlight = false, onClick }) {
  const [count, ref] = useCountUp(number, 1400, delay)
  const [pctCount, pctRef] = useCountUp(pct, 1200, delay + 200)

  const combinedRef = useCallback((el) => {
    ref.current = el
    pctRef.current = el
  }, [ref, pctRef])

  return (
    <div
      className={`funnel-stage${highlight ? ' funnel-stage--highlight' : ''}${onClick ? ' funnel-stage--clickable' : ''}`}
      ref={combinedRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="funnel-stage-bar-wrap">
        <div
          className="funnel-stage-bar"
          style={{ height: `${pct}%`, background: color }}
        />
      </div>
      <div className="funnel-stage-number" style={{ color }}>
        {count.toLocaleString()}
      </div>
      <div className="funnel-stage-pct" style={{ color }}>
        {pctCount}%
      </div>
      <div className="funnel-stage-label">{label}</div>
      <div className="funnel-stage-sublabel">{sublabel}</div>
    </div>
  )
}

export default function CaseFunnel() {
  const navigate = useNavigate()
  const { total, appellate, scotus, scotusFor, scotusAgainst } = FUNNEL_STATS
  const scotusPending = scotus - scotusFor - scotusAgainst
  const scotusDecided = scotusFor + scotusAgainst
  const scotusForPct  = scotusDecided > 0 ? Math.round(scotusFor / scotusDecided * 100) : 0

  const [forWidth, setForWidth]         = useState(0)
  const [againstWidth, setAgainstWidth] = useState(0)
  const [pendingWidth, setPendingWidth] = useState(0)
  const barRef = useRef(null)
  const barTriggered = useRef(false)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !barTriggered.current) {
        barTriggered.current = true
        setTimeout(() => {
          setForWidth(Math.round(scotusFor / scotus * 100))
          setAgainstWidth(Math.round(scotusAgainst / scotus * 100))
          setPendingWidth(Math.round(scotusPending / scotus * 100))
        }, 200)
        obs.disconnect()
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [scotusFor, scotusAgainst, scotusPending, scotus])

  const appellateOff = Math.round(appellate / total * 100)
  const scotusOff    = Math.round(scotus    / total * 100)

  return (
    <section className="funnel-section">
      <h2 className="stats-heading">How Far Do Cases Get?</h2>
      <p className="funnel-subtitle">
        Most challenges are resolved at the district court level. A fraction survive to
        the circuit courts — and only the most consequential reach the Supreme Court.
      </p>

      {/* ── Stage pipeline ─────────────────────────────── */}
      <div className="funnel-pipeline">
        <Stage
          number={total}
          label="Cases Filed"
          sublabel="District courts"
          pct={100}
          color="#457b9d"
          delay={0}
          onClick={() => navigate('/cases?level=district')}
        />

        <div className="funnel-arrow-col">
          <div className="funnel-arrow-badge">{appellateOff}%</div>
          <div className="funnel-arrow-line" />
          <svg className="funnel-arrow-svg" viewBox="0 0 12 20" fill="none">
            <path d="M1 1l10 9-10 9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <Stage
          number={appellate}
          label="Reached Appeals Court"
          sublabel="Circuit courts"
          pct={appellateOff}
          color="#f4a261"
          delay={150}
          onClick={() => navigate('/cases?level=appeals')}
        />

        <div className="funnel-arrow-col">
          <div className="funnel-arrow-badge">{scotusOff}%</div>
          <div className="funnel-arrow-line" />
          <svg className="funnel-arrow-svg" viewBox="0 0 12 20" fill="none">
            <path d="M1 1l10 9-10 9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <Stage
          number={scotus}
          label="Reached Supreme Court"
          sublabel="SCOTUS petitions"
          pct={scotusOff}
          color="#e63946"
          delay={300}
          highlight
          onClick={() => navigate('/cases?level=supreme')}
        />
      </div>

      {/* ── SCOTUS breakdown ───────────────────────────── */}
      <div className="scotus-card" ref={barRef}>
        <div className="scotus-card-top">
          <div className="scotus-card-left">
            <div className="scotus-card-eyebrow">Supreme Court Rulings</div>
            <div className="scotus-big-pct">
              {scotusForPct}<span className="scotus-pct-sign">%</span>
            </div>
            <div className="scotus-big-label">
              of decided cases sided with the administration
            </div>
            <div className="scotus-decided-note">
              {scotusDecided} of {scotus} SCOTUS cases decided · {scotusPending} pending
            </div>
          </div>
          <div className="scotus-card-right">
            <div className="scotus-legend">
              <div className="scotus-legend-item">
                <span className="scotus-dot scotus-dot--for" />
                <span>Ruled for admin</span>
                <strong>{scotusFor}</strong>
              </div>
              <div className="scotus-legend-item">
                <span className="scotus-dot scotus-dot--against" />
                <span>Ruled against admin</span>
                <strong>{scotusAgainst}</strong>
              </div>
              <div className="scotus-legend-item">
                <span className="scotus-dot scotus-dot--pending" />
                <span>Pending</span>
                <strong>{scotusPending}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="scotus-split-bar">
          <div
            className="scotus-bar-for"
            style={{ width: `${forWidth}%` }}
            title={`Ruled for admin: ${scotusFor}`}
          />
          <div
            className="scotus-bar-against"
            style={{ width: `${againstWidth}%` }}
            title={`Ruled against admin: ${scotusAgainst}`}
          />
          <div
            className="scotus-bar-pending"
            style={{ width: `${pendingWidth}%` }}
            title={`Pending: ${scotusPending}`}
          />
        </div>
      </div>
    </section>
  )
}
