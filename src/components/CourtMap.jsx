import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { ALL_CASES } from '../data/issues'
import { CL_CASES } from '../data/clCases'
import { COURT_TO_CIRCUIT, STATE_FIPS_TO_CIRCUIT, CIRCUIT_NAMES, SPECIAL_COURT_COORDS } from '../data/courtCircuits'
import './CourtMap.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
const DC_COORDS = [-77.009, 38.889]
const COMBINED_CASES = [...ALL_CASES, ...CL_CASES]

function computeCircuitStats() {
  const stats = {}
  COMBINED_CASES.forEach(c => {
    const circuit = COURT_TO_CIRCUIT[c.court]
    if (!circuit) return
    if (!stats[circuit]) {
      stats[circuit] = { total: 0, active: 0, injunction: 0, closedFor: 0, closedAgainst: 0 }
    }
    stats[circuit].total++
    if (c.status === 'active')         stats[circuit].active++
    if (c.status === 'injunction')     stats[circuit].injunction++
    if (c.status === 'closed-for')     stats[circuit].closedFor++
    if (c.status === 'closed-against') stats[circuit].closedAgainst++
  })
  return stats
}

function getColor(count, maxCount) {
  if (!count || count === 0) return 'rgba(255,255,255,0.04)'
  const t = count / maxCount
  if (t < 0.25) return 'rgba(56,189,248,0.35)'
  if (t < 0.5)  return 'rgba(99,102,241,0.50)'
  if (t < 0.75) return 'rgba(139,92,246,0.65)'
  return 'rgba(192,132,252,0.82)'
}

function getHoverColor(count, maxCount) {
  if (!count || count === 0) return 'rgba(255,255,255,0.12)'
  const t = count / maxCount
  if (t < 0.25) return 'rgba(56,189,248,0.65)'
  if (t < 0.5)  return 'rgba(99,102,241,0.82)'
  if (t < 0.75) return 'rgba(139,92,246,0.94)'
  return 'rgba(192,132,252,1.0)'
}

// No dimming of other circuits — only brighten the hovered one
function getCircuitFill(count, maxCount, circuitKey, hoveredCircuit) {
  if (hoveredCircuit && circuitKey === hoveredCircuit) {
    return getHoverColor(count, maxCount)
  }
  return getColor(count, maxCount)
}

export default function CourtMap() {
  const navigate = useNavigate()
  const [tooltip, setTooltip]         = useState(null)
  const [hoveredCircuit, setHoveredCircuit] = useState(null)
  const circuitStats = useMemo(() => computeCircuitStats(), [])
  const maxCases = useMemo(
    () => Math.max(...Object.values(circuitStats).map(s => s.total), 1),
    [circuitStats]
  )

  const handleEnter = useCallback((e, circuit) => {
    const stats = circuitStats[circuit] || { total: 0, active: 0, injunction: 0, closedFor: 0, closedAgainst: 0 }
    setHoveredCircuit(circuit)
    setTooltip({ x: e.clientX, y: e.clientY, circuit, stats })
  }, [circuitStats])

  const handleMove = useCallback((e) => {
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)
  }, [])

  const handleLeave = useCallback(() => {
    setHoveredCircuit(null)
    setTooltip(null)
  }, [])

  const handleClick = useCallback((circuit) => {
    navigate(`/cases?circuit=${circuit}`)
  }, [navigate])

  const dcStats   = circuitStats['dc'] || { total: 0, active: 0, injunction: 0, closedFor: 0, closedAgainst: 0 }
  const dcFill    = getCircuitFill(dcStats.total, maxCases, 'dc', hoveredCircuit)
  const dcHovered = hoveredCircuit === 'dc'

  const citStats   = circuitStats['cit'] || { total: 0, active: 0, injunction: 0, closedFor: 0, closedAgainst: 0 }
  const citFill    = getCircuitFill(citStats.total, maxCases, 'cit', hoveredCircuit)
  const citHovered = hoveredCircuit === 'cit'

  return (
    <section className="court-map-section">
      <h2 className="stats-heading">Where Cases Are Being Challenged</h2>
      <p className="court-map-subtitle">
        Click a state to filter cases by circuit court.
      </p>

      <div className="court-map-wrap" onMouseMove={handleMove}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 900 }}
          width={800}
          height={500}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const fips    = String(geo.id).padStart(2, '0')
                const circuit = STATE_FIPS_TO_CIRCUIT[fips]
                const count   = circuit ? (circuitStats[circuit]?.total ?? 0) : 0
                const isHov   = circuit && circuit === hoveredCircuit
                const fill    = getCircuitFill(count, maxCases, circuit, hoveredCircuit)
                const stroke  = isHov ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.10)'
                const strokeW = isHov ? 1.4 : 0.5
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    style={{
                      default: { fill, outline: 'none' },
                      hover:   { fill, outline: 'none', cursor: circuit ? 'pointer' : 'default' },
                      pressed: { fill, outline: 'none' },
                    }}
                    onMouseEnter={circuit ? e => handleEnter(e, circuit) : undefined}
                    onMouseLeave={circuit ? handleLeave : undefined}
                    onClick={circuit ? () => handleClick(circuit) : undefined}
                  />
                )
              })
            }
          </Geographies>

          {/* D.C. Circuit marker */}
          <Marker coordinates={DC_COORDS}>
            <circle
              r={dcHovered ? 10 : 8}
              fill={dcFill}
              stroke={dcHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'}
              strokeWidth={dcHovered ? 1.8 : 1.2}
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={e => handleEnter(e, 'dc')}
              onMouseLeave={handleLeave}
              onClick={() => handleClick('dc')}
            />
            <text
              textAnchor="middle"
              y={-13}
              style={{ fill: dcHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)', fontSize: '9px', pointerEvents: 'none' }}
            >
              D.C.
            </text>
          </Marker>

          {/* Court of International Trade marker (Manhattan) */}
          {citStats.total > 0 && (
            <Marker coordinates={SPECIAL_COURT_COORDS.cit}>
              <circle
                r={citHovered ? 9 : 7}
                fill={citFill}
                stroke={citHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'}
                strokeWidth={citHovered ? 1.6 : 1.0}
                strokeDasharray="3 2"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                onMouseEnter={e => handleEnter(e, 'cit')}
                onMouseLeave={handleLeave}
                onClick={() => handleClick('cit')}
              />
              <text
                textAnchor="middle"
                y={-11}
                style={{ fill: citHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', fontSize: '8px', pointerEvents: 'none' }}
              >
                CIT
              </text>
            </Marker>
          )}
        </ComposableMap>

        {/* Legend */}
        <div className="court-map-legend">
          <span className="legend-label">Fewer cases</span>
          <div className="legend-swatch legend-swatch--1" />
          <div className="legend-swatch legend-swatch--2" />
          <div className="legend-swatch legend-swatch--3" />
          <div className="legend-swatch legend-swatch--4" />
          <span className="legend-label">More cases</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="court-map-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="cmt-title">{CIRCUIT_NAMES[tooltip.circuit]}</div>
          <div className="cmt-row">
            <span>Total filed</span>
            <strong>{tooltip.stats.total}</strong>
          </div>
          <div className="cmt-divider" />
          <div className="cmt-row">
            <span className="cmt-dot cmt-dot--active" />
            <span>Active</span>
            <strong>{tooltip.stats.active}</strong>
          </div>
          <div className="cmt-row">
            <span className="cmt-dot cmt-dot--injunction" />
            <span>Policy halted</span>
            <strong>{tooltip.stats.injunction}</strong>
          </div>
          <div className="cmt-row">
            <span className="cmt-dot cmt-dot--closed-for" />
            <span>Closed — for admin</span>
            <strong>{tooltip.stats.closedFor}</strong>
          </div>
          <div className="cmt-row">
            <span className="cmt-dot cmt-dot--closed-against" />
            <span>Closed — against admin</span>
            <strong>{tooltip.stats.closedAgainst}</strong>
          </div>
          <div className="cmt-click-hint">Click to filter cases →</div>
        </div>
      )}
    </section>
  )
}
