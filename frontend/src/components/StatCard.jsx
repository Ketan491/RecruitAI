// StatCard.jsx — Dashboard metric card
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, color = 'cyan', delay = 0 }) {
  const colors = {
    cyan:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    border: 'border-cyan-500/20'    },
    violet:  { bg: 'bg-violet-500/10',  icon: 'text-violet-400',  border: 'border-violet-500/20'  },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20'   },
    rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-400',    border: 'border-rose-500/20'    },
  }
  const c = colors[color] || colors.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-hover p-5 border ${c.border} relative overflow-hidden`}
    >
      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px shimmer" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="font-display font-bold text-2xl text-white">{value}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
    </motion.div>
  )
}
