import { motion } from 'framer-motion'

export default function ScoreRing({ score = 0, size = 140, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return ['#10b981', '#06b6d4']
    if (s >= 60) return ['#6366f1', '#a855f7']
    if (s >= 40) return ['#f59e0b', '#f97316']
    return ['#ef4444', '#ec4899']
  }
  const [c1, c2] = getColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Score arc */}
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-display font-bold text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-white/40 mt-0.5">ATS Score</span>
      </div>
    </div>
  )
}
