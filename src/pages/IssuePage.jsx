import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import StatCard from '../components/StatCard'
import NavBar from '../components/NavBar'
import { ISSUES_BY_SLUG } from '../data/issues'
import './IssuePage.css'

const STATUS_CONFIG = {
  'active':         { label: 'Active',            cls: 'badge-active' },
  'injunction':     { label: 'Injunction',        cls: 'badge-injunction' },
  'closed-for':     { label: 'Closed — For',      cls: 'badge-closed-for' },
  'closed-against': { label: 'Closed — Against',  cls: 'badge-closed-against' },
}

export default function IssuePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const issue = ISSUES_BY_SLUG[slug]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!issue) {
    return (
      <div className="app">
        <div className="bg-gradient" />
        <NavBar />
        <div className="issue-not-found">
          <p>Issue not found.</p>
          <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← All Issues
        </button>
      </div>

      <main className="issue-hero">
        <h1 className="issue-hero-title">{issue.title}</h1>
        <p className="issue-hero-desc">{issue.description}</p>
      </main>

      <section className="stats-section">
        <h2 className="stats-heading">By the Numbers</h2>
        <div className="stats-grid">
          {issue.stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </section>

      <section className="cases-section">
        <h2 className="stats-heading">Cases in This Category</h2>
        <div className="cases-list">
          {issue.cases.map(c => {
            const cfg = STATUS_CONFIG[c.status] || { label: c.status, cls: 'badge-active' }
            return (
              <button
                key={c.id}
                className="case-row case-row--clickable"
                onClick={() => navigate(`/case/${c.id}`)}
              >
                <div className="case-row-main">
                  <span className="case-name">{c.name}</span>
                  <div className="case-row-right">
                    <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>
                    <span className="case-row-arrow">→</span>
                  </div>
                </div>
                <div className="case-row-meta">
                  <span className="case-meta-item">{c.court}</span>
                  <span className="case-meta-divider">·</span>
                  <span className="case-meta-item">Filed {c.dateFiled}</span>
                  <span className="case-meta-divider">·</span>
                  <span className="case-meta-item case-id-label">{c.id}</span>
                </div>
                <p className="case-description">{c.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="footer">
        <p>Data is for informational purposes. Numbers are updated as cases progress.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>

      <div className="bottom-banner">
        A project of the Notre Dame Kellogg Institute
      </div>
    </div>
  )
}
