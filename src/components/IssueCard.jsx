import { useNavigate } from 'react-router-dom'
import './IssueCard.css'

export default function IssueCard({ issue, caseCount }) {
  const navigate = useNavigate()
  const count = caseCount ?? issue.cases.length

  return (
    <button
      className="issue-card"
      style={{ '--accent': issue.color }}
      onClick={() => navigate(`/cases?topic=${issue.slug}`)}
      aria-label={`Browse ${issue.title} cases`}
    >
      <span className="issue-card-title">{issue.title}</span>
      <span className="issue-card-count">{count} cases</span>
      <span className="issue-card-arrow">→</span>
    </button>
  )
}
