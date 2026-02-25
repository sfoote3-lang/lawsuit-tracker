import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEGAL_TERMS, TERM_PATTERNS } from '../data/legalTerms'
import './LegalTooltip.css'

// Single term tooltip wrapper
export function LegalTooltip({ termKey, children }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: true }) // true = tooltip above
  const ref = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const data = LEGAL_TERMS[termKey]

  useEffect(() => {
    if (!open || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.top > 140 })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (!data) return <>{children}</>

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setOpen(true), 2000)
  }

  function handleMouseLeave() {
    clearTimeout(timerRef.current)
    setOpen(false)
  }

  return (
    <span
      className="legal-term"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setOpen(true)}
      onBlur={() => { clearTimeout(timerRef.current); setOpen(false) }}
      tabIndex={0}
      role="button"
      aria-label={`Legal term: ${data.term}`}
    >
      {children}
      {open && (
        <span className={`legal-tooltip-popup ${pos.top ? 'ltp--above' : 'ltp--below'}`}>
          <span className="ltp-term">{data.term}</span>
          <span className="ltp-def">{data.shortDef}</span>
          <button
            className="ltp-more"
            onMouseDown={(e) => {
              e.preventDefault()
              navigate(`/dictionary#${termKey}`)
            }}
          >
            Full definition + examples →
          </button>
        </span>
      )}
    </span>
  )
}

// Annotates a plain text string, wrapping known legal terms with <LegalTooltip>
export function AnnotatedText({ text, className }) {
  if (!text) return null

  // Build parts: alternate between plain strings and { termKey, text } objects
  let parts = [{ type: 'plain', text }]

  for (const { regex, key } of TERM_PATTERNS) {
    const next = []
    for (const part of parts) {
      if (part.type !== 'plain') {
        next.push(part)
        continue
      }
      regex.lastIndex = 0
      let last = 0
      let m
      while ((m = regex.exec(part.text)) !== null) {
        if (m.index > last) next.push({ type: 'plain', text: part.text.slice(last, m.index) })
        next.push({ type: 'term', key, text: m[0] })
        last = m.index + m[0].length
      }
      if (last < part.text.length) next.push({ type: 'plain', text: part.text.slice(last) })
    }
    parts = next
  }

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === 'term' ? (
          <LegalTooltip key={i} termKey={p.key}>{p.text}</LegalTooltip>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  )
}
