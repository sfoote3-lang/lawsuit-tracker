import { useState, useEffect, useRef } from 'react'
import './StatCard.css'

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start || target === 0) return

    let startTime = null
    const startValue = 0

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * (target - startValue) + startValue))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }

    requestAnimationFrame(step)
  }, [target, duration, start])

  return count
}

export default function StatCard({ number, label, sublabel, color, delay = 0, large = false }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const count = useCountUp(number, 1800, visible)

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.3 }
      )
      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className="stat-card" ref={ref} style={{ '--accent': color }}>
      <div className="stat-number">{count.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{ width: visible ? '100%' : '0%' }}
        />
      </div>
    </div>
  )
}
