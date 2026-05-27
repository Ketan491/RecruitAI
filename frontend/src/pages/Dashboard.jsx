/**
 * User dashboard — main home after login.
 * Shows stats, quick actions, skills overview.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Target, Mic, Lightbulb, ArrowRight,
  TrendingUp, Award, Zap, Upload, ChevronRight
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import StatCard from '../components/ui/StatCard'
import SkillBadge from '../components/ui/SkillBadge'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const quickActions = [
  { to: '/resume', icon: Upload, label: 'Upload Resume', desc: 'Analyze your resume with AI', color: 'bg-brand-600/20 text-brand-400 border-brand-500/20' },
  { to: '/ats', icon: Target, label: 'Check ATS Score', desc: 'Match against a job description', color: 'bg-purple-600/20 text-purple-400 border-purple-500/20' },
  { to: '/interview', icon: Mic, label: 'Mock Interview', desc: 'Practice with AI feedback', color: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/20' },
  { to: '/recommendations', icon: Lightbulb, label: 'Get Recommendations', desc: 'Discover best-fit roles', color: 'bg-pink-600/20 text-pink-400 border-pink-500/20' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/users/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/40 text-sm mb-1"
        >
          {greeting} 👋
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-4xl text-white"
        >
          {user?.name?.split(' ')[0]}'s Dashboard
        </motion.h1>
        {!user?.resume_uploaded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2"
          >
            <Zap size={14} className="text-amber-400" />
            <span className="text-amber-400 text-sm">Upload your resume to unlock all features</span>
            <Link to="/resume" className="text-amber-300 text-sm font-medium hover:underline ml-1">Do it now →</Link>
          </motion.div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={FileText} label="Resumes" value={stats?.resume_count ?? 0} color="brand" delay={0} />
        <StatCard icon={Target} label="ATS Checks" value={stats?.ats_evaluations ?? 0} color="purple" delay={0.1} />
        <StatCard icon={Mic} label="Interviews" value={stats?.interview_sessions ?? 0} color="cyan" delay={0.2} />
        <StatCard icon={Award} label="Best ATS" value={stats?.best_ats_score ? `${stats.best_ats_score}%` : '—'} color="emerald" delay={0.3} />
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="font-display font-semibold text-xl text-white mb-5">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
            >
              <Link to={action.to}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`glass border rounded-2xl p-5 h-full card-hover ${action.color}`}
                >
                  <div className={`w-10 h-10 rounded-xl border ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{action.label}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{action.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-60">
                    <span>Go</span><ChevronRight size={12} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skills section */}
      {user?.skills?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-white">Your Skills</h2>
            <span className="text-white/30 text-sm">{user.skills.length} detected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(skill => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </div>
          <Link to="/resume" className="flex items-center gap-1 text-brand-400 text-sm mt-4 hover:text-brand-300 transition-colors">
            <TrendingUp size={14} /> Update resume to refresh skills
          </Link>
        </motion.div>
      )}

      {/* Empty state */}
      {(!user?.skills || user.skills.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-12 text-center border border-white/5"
        >
          <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-brand-400" />
          </div>
          <h3 className="font-display font-semibold text-xl text-white mb-2">Upload your resume to get started</h3>
          <p className="text-white/40 text-sm mb-6">Our AI will extract your skills, experience, and more automatically.</p>
          <Link to="/resume" className="btn-primary inline-flex items-center gap-2">
            Upload Resume <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}
    </AppLayout>
  )
}
