import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import IssueCard from '../components/IssueCard'
import NavBar from '../components/NavBar'
import CourtMap from '../components/CourtMap'
import CaseFunnel from '../components/CaseFunnel'
import JudgesViz from '../components/JudgesViz'
import { ISSUES, ALL_CASES } from '../data/issues'
import { CL_CASES } from '../data/clCases'
import { UPDATES } from '../data/updates'
import './HomePage.css'

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const COMBINED_CASES = [...ALL_CASES, ...CL_CASES]

const START_DATE = new Date('2025-01-20')

function daysSince(date) {
  const now = new Date()
  return Math.floor((now - date) / (1000 * 60 * 60 * 24))
}

export default function HomePage() {
  const navigate = useNavigate()
  const days = daysSince(START_DATE)

  // Compute live counts from combined cases
  const stats = useMemo(() => {
    const s = { total: 0, active: 0, injunction: 0, closedFor: 0, closedAgainst: 0 }
    COMBINED_CASES.forEach(c => {
      s.total++
      if (c.status === 'active')         s.active++
      if (c.status === 'injunction')     s.injunction++
      if (c.status === 'closed-for')     s.closedFor++
      if (c.status === 'closed-against') s.closedAgainst++
    })
    return s
  }, [])

  // Combined case count per issue for Browse by Issue cards
  const issueCounts = useMemo(() => {
    const counts = {}
    COMBINED_CASES.forEach(c => {
      if (c.issueSlug) counts[c.issueSlug] = (counts[c.issueSlug] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <main className="hero">
        <div className="hero-eyebrow">
          <span className="dot" />
          {days} days since January 20, 2025
        </div>
        <h1 className="hero-title">
          Legal Challenges to the
          <br />
          <span className="hero-highlight">Trump Administration</span>
        </h1>
        <p className="hero-subtitle">
          Tracking major federal lawsuits filed since the start of the second
          Trump administration. Data covers cases challenging executive orders,
          agency actions, and policy directives.
        </p>
      </main>

      <section className="primary-stat-section">
        <button className="primary-stat-btn" onClick={() => navigate('/cases')}>
          <StatCard
            number={stats.total}
            label="Federal Cases Tracked"
            sublabel={`Since January 20, 2025 — ${days} days ago`}
            color="#e63946"
            delay={0}
            large
          />
          <span className="primary-stat-cta">View all cases →</span>
        </button>
      </section>

      <section className="stats-section">
        <h2 className="stats-heading">Breakdown by Status</h2>
        <div className="stats-grid">
          <button className="stat-filter-btn" onClick={() => navigate('/cases?status=active')}>
            <StatCard
              number={stats.active}
              label="Active & Ongoing"
              sublabel="Cases currently in litigation with no final ruling"
              color="#457b9d"
              delay={100}
            />
            <span className="stat-filter-cta">Filter cases →</span>
          </button>
          <button className="stat-filter-btn" onClick={() => navigate('/cases?status=injunction')}>
            <StatCard
              number={stats.injunction}
              label="Policy Temporarily Halted"
              sublabel="Active cases where a court issued a temporary injunction"
              color="#f4a261"
              delay={200}
            />
            <span className="stat-filter-cta">Filter cases →</span>
          </button>
          <button className="stat-filter-btn" onClick={() => navigate('/cases?status=closed-for')}>
            <StatCard
              number={stats.closedFor}
              label="Closed — Ruling for Admin"
              sublabel="Final ruling in favor of the administration"
              color="#2a9d8f"
              delay={300}
            />
            <span className="stat-filter-cta">Filter cases →</span>
          </button>
          <button className="stat-filter-btn" onClick={() => navigate('/cases?status=closed-against')}>
            <StatCard
              number={stats.closedAgainst}
              label="Closed — Ruling Against Admin"
              sublabel="Final ruling against the administration"
              color="#e63946"
              delay={400}
            />
            <span className="stat-filter-cta">Filter cases →</span>
          </button>
        </div>
      </section>

      <section className="issues-section">
        <h2 className="stats-heading">Browse by Issue</h2>
        <div className="issues-grid">
          {ISSUES.map(issue => (
            <IssueCard
              key={issue.slug}
              issue={issue}
              caseCount={issueCounts[issue.slug] || 0}
            />
          ))}
        </div>
      </section>

      <CaseFunnel />

      <CourtMap />

      <JudgesViz />

      {/* ── Latest Updates ─────────────────────────────── */}
      <section className="home-news-section">
        <div className="home-news-header">
          <h2 className="stats-heading" style={{ marginBottom: 0 }}>Latest Updates</h2>
          <button className="home-news-more-btn" onClick={() => navigate('/news')}>
            View all updates →
          </button>
        </div>
        <div className="home-news-list">
          {UPDATES.slice(0, 3).map(article => (
            <button
              key={article.id}
              className="home-news-card"
              onClick={() => navigate('/news')}
            >
              <div className="home-news-meta">
                <span className="home-news-date">{formatDate(article.date)}</span>
                {article.tags.slice(0, 2).map(t => (
                  <span key={t} className="home-news-tag">{t.replace(/-/g, ' ')}</span>
                ))}
              </div>
              <div className="home-news-title">{article.title}</div>
              <p className="home-news-summary">{article.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          Data is for informational purposes. Numbers are updated as cases
          progress.
        </p>
        <p className="footer-small">
          Not affiliated with any political organization.
        </p>
      </footer>

      <div className="bottom-banner">
        A project of the Notre Dame Kellogg Institute
      </div>
    </div>
  )
}
