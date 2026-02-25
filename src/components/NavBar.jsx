import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISSUES, ALL_CASES } from '../data/issues'
import './NavBar.css'

const STATUS_LABELS = {
  'active':         'Active',
  'injunction':     'Injunction',
  'closed-for':     'Closed — For',
  'closed-against': 'Closed — Against',
}

const STATUS_COLORS = {
  'active':         '#457b9d',
  'injunction':     '#f4a261',
  'closed-for':     '#2a9d8f',
  'closed-against': '#e63946',
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function searchAll(query) {
  const q = query.toLowerCase().trim()
  if (!q) return { issues: [], cases: [] }

  const matchedIssues = ISSUES.filter(issue =>
    issue.title.toLowerCase().includes(q) ||
    issue.description.toLowerCase().includes(q)
  )

  const matchedCases = ALL_CASES.filter(c =>
    c.id.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.court.toLowerCase().includes(q) ||
    c.issueTitle.toLowerCase().includes(q)
  )

  return { issues: matchedIssues, cases: matchedCases }
}

export default function NavBar() {
  const navigate = useNavigate()
  const [issueOpen, setIssueOpen] = useState(false)
  const [query, setQuery]         = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const issueRef  = useRef(null)
  const searchRef = useRef(null)

  useOutsideClick(issueRef,  () => setIssueOpen(false))
  useOutsideClick(searchRef, () => { setSearchOpen(false); setQuery('') })

  const results    = searchAll(query)
  const hasResults = results.issues.length > 0 || results.cases.length > 0
  const showPanel  = searchOpen && query.trim().length > 0

  function go(path) {
    setIssueOpen(false)
    setSearchOpen(false)
    setQuery('')
    navigate(path)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setSearchOpen(false); setQuery('') }
    if (e.key === 'Enter' && query.trim()) {
      go(`/cases?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => go('/')}>
          Lawsuit Tracker
        </button>

        <div className="navbar-right">
          {/* Plain nav links */}
          <button className="navbar-link" onClick={() => go('/news')}>News</button>
          <button className="navbar-link" onClick={() => go('/about')}>About</button>
          <button className="navbar-link navbar-link--dict" onClick={() => go('/dictionary')}>
            <svg viewBox="0 0 13 13" fill="none" className="navbar-dict-icon">
              <path d="M2 10V2h7l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M5 5.5h3M5 7.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            Dictionary
          </button>

          {/* Issues dropdown */}
          <div className="navbar-dropdown" ref={issueRef}>
            <button
              className={`navbar-issues-btn ${issueOpen ? 'open' : ''}`}
              onClick={() => setIssueOpen(o => !o)}
            >
              Issues
              <svg className="caret" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {issueOpen && (
              <div className="dropdown-menu">
                {ISSUES.map(issue => (
                  <button
                    key={issue.slug}
                    className="dropdown-item"
                    style={{ '--accent': issue.color }}
                    onClick={() => go(`/issue/${issue.slug}`)}
                  >
                    <span className="dropdown-item-dot" />
                    {issue.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="navbar-search" ref={searchRef}>
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search cases, case ID, court..."
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button className="search-clear" onClick={() => { setQuery(''); setSearchOpen(false) }}>
                  <svg viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {showPanel && (
              <div className="search-panel">
                {!hasResults && (
                  <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
                )}

                {results.issues.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-label">Issues</div>
                    {results.issues.map(issue => (
                      <button
                        key={issue.slug}
                        className="search-result"
                        onClick={() => go(`/issue/${issue.slug}`)}
                      >
                        <span className="result-dot" style={{ background: issue.color }} />
                        <div className="result-text">
                          <span className="result-primary">{issue.title}</span>
                          <span className="result-secondary">{issue.cases.length} cases</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.cases.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-label">
                      Cases
                      {results.cases.length > 6 && (
                        <span className="search-group-count">{results.cases.length} matches</span>
                      )}
                    </div>
                    {results.cases.slice(0, 8).map(c => (
                      <button
                        key={c.id}
                        className="search-result"
                        onClick={() => go(`/case/${c.id}`)}
                      >
                        <span
                          className="result-dot"
                          style={{ background: STATUS_COLORS[c.status] ?? 'rgba(255,255,255,0.3)' }}
                        />
                        <div className="result-text">
                          <span className="result-primary">{c.name}</span>
                          <span className="result-secondary">
                            <span
                              className="result-status-badge"
                              style={{ color: STATUS_COLORS[c.status], borderColor: `${STATUS_COLORS[c.status]}40`, background: `${STATUS_COLORS[c.status]}14` }}
                            >
                              {STATUS_LABELS[c.status] ?? c.status}
                            </span>
                            {c.court}
                            <span className="result-id">{c.id}</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* View all / filter in cases page */}
                {hasResults && (
                  <button
                    className="search-view-all"
                    onClick={() => go(`/cases?q=${encodeURIComponent(query.trim())}`)}
                  >
                    View all results in case browser →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
