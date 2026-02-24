import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { CASES_BY_ID } from '../data/issues'
import { UPDATES, UPDATE_TAGS } from '../data/updates'
import './NewsPage.css'

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function TagChip({ tag, active, onClick }) {
  return (
    <button
      className={`news-tag-chip ${active ? 'news-tag-chip--on' : ''}`}
      onClick={onClick}
    >
      {tag.label}
    </button>
  )
}

function ArticleCard({ article, defaultOpen = false }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <article className="article-card">
      <div className="article-top">
        <div className="article-meta-row">
          <span className="article-date">{formatDate(article.date)}</span>
          <div className="article-tags">
            {article.tags.map(t => {
              const tag = UPDATE_TAGS.find(x => x.value === t)
              return (
                <span key={t} className="article-tag">
                  {tag?.label ?? t}
                </span>
              )
            })}
          </div>
        </div>
        <h2 className="article-title">{article.title}</h2>
        <div className="article-author">By {article.author}</div>
      </div>

      <p className="article-summary">{article.summary}</p>

      {expanded && (
        <div className="article-body">
          {article.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      <div className="article-footer">
        <button
          className="article-expand-btn"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? (
            <>
              <svg viewBox="0 0 12 8" fill="none" className="expand-icon expand-icon--up">
                <path d="M1 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg viewBox="0 0 12 8" fill="none" className="expand-icon">
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Read full article
            </>
          )}
        </button>

        {article.relatedCaseIds.length > 0 && (
          <div className="article-related">
            <span className="related-label">Related cases:</span>
            {article.relatedCaseIds.map(id => {
              const c = CASES_BY_ID[id]
              if (!c) return null
              return (
                <button
                  key={id}
                  className="related-case-btn"
                  onClick={() => navigate(`/case/${id}`)}
                  style={{ '--case-color': c.issueColor }}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}

export default function NewsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const activeTag = params.get('tag') ?? ''

  function toggleTag(value) {
    const next = new URLSearchParams(params)
    next.get('tag') === value ? next.delete('tag') : next.set('tag', value)
    setParams(next)
  }

  const filtered = useMemo(() =>
    activeTag ? UPDATES.filter(u => u.tags.includes(activeTag)) : UPDATES,
    [activeTag]
  )

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
      </div>

      <header className="news-header">
        <h1 className="news-title">News &amp; Updates</h1>
        <p className="news-sub">
          Analysis and case updates from the Notre Dame Kellogg Institute research team.
        </p>
      </header>

      {/* Tag filter */}
      <div className="news-filters">
        {UPDATE_TAGS.filter(t => UPDATES.some(u => u.tags.includes(t.value))).map(tag => (
          <TagChip
            key={tag.value}
            tag={tag}
            active={activeTag === tag.value}
            onClick={() => toggleTag(tag.value)}
          />
        ))}
        {activeTag && (
          <button className="news-clear-tag" onClick={() => {
            const next = new URLSearchParams(params)
            next.delete('tag')
            setParams(next)
          }}>
            <svg viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Article list */}
      <div className="news-body">
        {filtered.length === 0 ? (
          <div className="news-empty">No articles with this tag yet.</div>
        ) : (
          filtered.map((article, i) => (
            <ArticleCard key={article.id} article={article} defaultOpen={i === 0} />
          ))
        )}
      </div>

      <footer className="footer">
        <p>Content is written and reviewed by the Notre Dame Kellogg Institute research team.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
