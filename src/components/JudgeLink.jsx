import { useNavigate } from 'react-router-dom'
import { JUDGES_DATA, JUDGE_BY_NAME } from '../data/judgesData'
import './JudgeLink.css'

const CURRENT_YEAR = new Date().getFullYear()

function truncate(str, max) {
  if (!str || str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

function yearsService(commissionDate) {
  if (!commissionDate) return null
  const year = parseInt(commissionDate.split('-')[0], 10)
  if (isNaN(year)) return null
  return CURRENT_YEAR - year
}

function SingleJudgeLink({ name }) {
  const navigate = useNavigate()
  const jid    = JUDGE_BY_NAME[name.toLowerCase()]
  const judge  = jid ? JUDGES_DATA[jid] : null

  if (!judge || !judge.appointments.length) {
    return <span className="judge-plain">{name}</span>
  }

  const appt       = judge.appointments[judge.appointments.length - 1]
  const party      = appt.party ?? ''
  const partyColor = party === 'Democratic' ? '#457b9d' : party === 'Republican' ? '#e63946' : '#888'
  const partyLabel = party === 'Democratic' ? 'DEMOCRATIC APPOINTEE'
                   : party === 'Republican' ? 'REPUBLICAN APPOINTEE'
                   : ''
  const courtShort = truncate(appt.courtName ?? '', 42)
  const yrs        = yearsService(appt.commissionDate)
  const commYear   = appt.commissionDate ? appt.commissionDate.split('-')[0] : null

  function handleClick(e) {
    e.stopPropagation()
    e.preventDefault()
    navigate(`/judge/${jid}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      navigate(`/judge/${jid}`)
    }
  }

  return (
    <span className="judge-link-wrap">
      <span
        className="judge-link"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Judge ${name} — view profile`}
      >
        {name}
      </span>
      <span className="judge-tooltip" role="tooltip">
        {partyLabel && (
          <span className="judge-tooltip-party" style={{ '--party-color': partyColor }}>
            <span className="judge-tooltip-dot" />
            {partyLabel}
          </span>
        )}
        {courtShort && (
          <span className="judge-tooltip-court">{courtShort}</span>
        )}
        {commYear && (
          <span className="judge-tooltip-service">
            Serving since {commYear}
            {yrs !== null ? ` · ${yrs} yr${yrs !== 1 ? 's' : ''}` : ''}
          </span>
        )}
      </span>
    </span>
  )
}

export default function JudgeLink({ names }) {
  if (!names) return null

  const parts = names.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <>
      {parts.map((name, i) => (
        <span key={`${name}-${i}`} className="judge-link-item">
          {i > 0 && <span className="judge-sep"> · </span>}
          <SingleJudgeLink name={name} />
        </span>
      ))}
    </>
  )
}
