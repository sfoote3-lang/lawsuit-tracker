import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { LEGAL_TERMS } from '../data/legalTerms'
import './DictionaryPage.css'

const SORTED_KEYS = Object.keys(LEGAL_TERMS).sort((a, b) =>
  LEGAL_TERMS[a].term.localeCompare(LEGAL_TERMS[b].term)
)

export default function DictionaryPage() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  // Auto-expand from URL hash (e.g. /dictionary#tro)
  useEffect(() => {
    if (hash) {
      const key = hash.replace('#', '')
      if (LEGAL_TERMS[key]) {
        setExpanded(key)
        setTimeout(() => {
          document.getElementById(`dict-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
    window.scrollTo(0, 0)
  }, [hash])

  const filtered = SORTED_KEYS.filter(k => {
    if (!search) return true
    const q = search.toLowerCase()
    const t = LEGAL_TERMS[k]
    return (
      t.term.toLowerCase().includes(q) ||
      t.shortDef.toLowerCase().includes(q) ||
      t.aliases.some(a => a.toLowerCase().includes(q))
    )
  })

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <header className="dict-header">
        <div className="dict-header-eyebrow">Legal Reference</div>
        <h1 className="dict-title">Legal Terms Dictionary</h1>
        <p className="dict-subtitle">
          Plain-language definitions of legal terms used in federal litigation.
          Hover over highlighted terms anywhere on the site to see a quick definition, or browse the full glossary here.
        </p>
        <input
          className="dict-search"
          type="text"
          placeholder="Search terms…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>

      <div className="dict-list">
        {filtered.length === 0 && (
          <div className="dict-empty">No matching terms found for "{search}"</div>
        )}
        {filtered.map(key => {
          const t = LEGAL_TERMS[key]
          const isOpen = expanded === key
          return (
            <div key={key} id={`dict-${key}`} className={`dict-entry ${isOpen ? 'dict-entry--open' : ''}`}>
              <button
                className="dict-entry-header"
                onClick={() => setExpanded(isOpen ? null : key)}
                aria-expanded={isOpen}
              >
                <span className="dict-entry-term">{t.term}</span>
                <span className="dict-entry-short">{t.shortDef}</span>
                <span className="dict-entry-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="dict-entry-body">
                  <div className="dict-section">
                    <div className="dict-section-label">Full Definition</div>
                    <p className="dict-section-text">{t.fullDef}</p>
                  </div>

                  {t.examples?.length > 0 && (
                    <div className="dict-section">
                      <div className="dict-section-label">Examples</div>
                      <ul className="dict-examples">
                        {t.examples.map((ex, i) => {
                          // If example mentions Minnesota/Noem/Tostrud, link to case
                          const isGeminiCase = /minnesota|noem|tostrud|hennepin|minneapolis|january 24|january 26|february 2/i.test(ex)
                          return (
                            <li key={i} className="dict-example-item">
                              {ex}
                              {isGeminiCase && (
                                <button
                                  className="dict-case-link"
                                  onClick={() => navigate('/case/gemini-test')}
                                >
                                  View case →
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {t.links?.length > 0 && (
                    <div className="dict-section">
                      <div className="dict-section-label">Reputable Sources</div>
                      <div className="dict-links">
                        {t.links.map((lnk, i) => (
                          <a
                            key={i}
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dict-link"
                          >
                            <svg viewBox="0 0 12 12" fill="none" className="dict-link-icon">
                              <path d="M5 2H2v8h8V7M7 1h4v4M11 1L5.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {lnk.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <footer className="footer">
        <p>Definitions are provided for educational purposes to help non-lawyers understand federal litigation.</p>
        <p className="footer-small">Not legal advice. Verify against original sources and consult an attorney for legal guidance.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
