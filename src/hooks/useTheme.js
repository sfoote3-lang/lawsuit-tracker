import { useState, useEffect } from 'react'

const VALID = ['dark', 'light', 'official']
const KEY   = 'lt-theme'

export function useTheme() {
  const [theme, _set] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      const t = VALID.includes(s) ? s : 'dark'
      // Apply immediately to avoid flash on re-load
      document.documentElement.setAttribute('data-theme', t)
      return t
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  return [theme, (t) => VALID.includes(t) && _set(t)]
}
