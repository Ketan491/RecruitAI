import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'brand', delay = 0 }) {
  const colors = {
    brand: 'from-brand-600/20 to-brand-500/10 border-brand-500/20 text-brand-400',
    purple: 'from-purple-600/20 to-purple-500/10 border-purple-500/20 text-purple-400',
    cyan: 'from-cyan-600/20 to-cyan-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pink: 'from-pink-600/20 to-pink-500/10 border-pink-500/20 text-pink-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass rounded-2xl p-5 border bg-gradient-to-br ${colors[color]} card-hover`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon size={20} className={colors[color].split(' ').pop()} />
        </div>
      </div>
    </motion.div>
  )
}
