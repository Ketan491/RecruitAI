// ScoreRing.jsx — Animated circular score indicator
// Fix: cancel previous requestAnimationFrame before starting new animation
import { useEffect, useRef, useState } from 'react'

const RADIUS = 52
const CIRC   = 2 * Math.PI * RADIUS

function getColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#06B6D4'
  if (score >= 40) return '#F59E0B'
  return '#F43F5E'
}

export default function ScoreRing({ score = 0, size = 140, label = 'Score', animate = true }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef  = useRef(null)           // track active animation frame
  const color   = getColor(score)
  const offset  = CIRC - (displayed / 100) * CIRC
  const cx = size / 2, cy = size / 2

  useEffect(() => {
    // Cancel any in-progress animation before starting a new one
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    if (!animate) {
      setDisplayed(score)
      return
    }

    let start    = null
    const duration = 1400

    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease     = 1 - Math.pow(1 - progress, 3)  // cubic ease-out
      setDisplayed(Math.round(ease * score))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [score, animate])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={RADIUS} strokeWidth="6" className="score-ring-track" />
          <circle
            cx={cx} cy={cy} r={RADIUS} strokeWidth="6"
            className="score-ring-fill"
            stroke={color}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl text-white leading-none">{displayed}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
  )
}
