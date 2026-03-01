import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISSUES, ALL_CASES } from '../data/issues'
import { useTheme } from '../hooks/useTheme'
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

const THEME_OPTIONS = [
  {
    id: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M13.5 9.5a6 6 0 01-7-7 6 6 0 108 7.5 5.97 5.97 0 01-1-.5z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M3.6 12.4l1.4-1.4M11 5l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'official',
    label: 'Official',
    icon: (
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L13.5 3.5V8.5C13.5 11.5 11 13.5 8 14.5C5 13.5 2.5 11.5 2.5 8.5V3.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function NavBar() {
  const navigate = useNavigate()
  const [theme, setTheme]           = useTheme()
  const [issueOpen, setIssueOpen]   = useState(false)
  const [themeOpen, setThemeOpen]   = useState(false)
  const [query, setQuery]           = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const issueRef  = useRef(null)
  const themeRef  = useRef(null)
  const searchRef = useRef(null)

  useOutsideClick(issueRef,  () => setIssueOpen(false))
  useOutsideClick(themeRef,  () => setThemeOpen(false))
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

          {/* Theme picker */}
          <div className="navbar-dropdown" ref={themeRef}>
            <button
              className={`navbar-theme-btn ${themeOpen ? 'open' : ''}`}
              onClick={() => setThemeOpen(o => !o)}
              title="Change theme"
              aria-label="Change theme"
            >
              {THEME_OPTIONS.find(o => o.id === theme)?.icon}
            </button>

            {themeOpen && (
              <div className="dropdown-menu theme-menu">
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`dropdown-item ${theme === opt.id ? 'theme-option--active' : ''}`}
                    onClick={() => { setTheme(opt.id); setThemeOpen(false) }}
                  >
                    <span className="theme-option-icon">{opt.icon}</span>
                    {opt.label}
                    {theme === opt.id && <span className="theme-option-check">✓</span>}
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
