/**
 * Jobs Board — browse and search active job listings.
 * Candidates can filter by type and search by keyword.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Briefcase, MapPin, Clock, Zap,
  ChevronRight, Loader2, Filter, ExternalLink
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  'full-time':  'bg-brand-500/10 text-brand-400 border-brand-500/20',
  'internship': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'part-time':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const JobCard = ({ job, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35 }}
    whileHover={{ y: -3 }}
    className="glass rounded-2xl p-6 border border-white/5 card-hover"
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-white text-lg leading-tight mb-1 truncate">
          {job.title}
        </h3>
        <p className="text-white/50 text-sm font-medium">{job.company}</p>
      </div>
      <span className={`flex-shrink-0 ml-3 text-xs font-medium px-3 py-1.5 rounded-lg border capitalize ${TYPE_COLORS[job.type] || TYPE_COLORS['full-time']}`}>
        {job.type}
      </span>
    </div>

    {/* Meta */}
    <div className="flex flex-wrap gap-4 text-xs text-white/40 mb-4">
      <span className="flex items-center gap-1.5">
        <MapPin size={12} /> {job.location}
      </span>
      {job.salary && (
        <span className="flex items-center gap-1.5">
          <Zap size={12} className="text-brand-400" />
          <span className="text-brand-400/70">{job.salary}</span>
        </span>
      )}
    </div>

    {/* Description */}
    <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
      {job.description}
    </p>

    {/* Required skills */}
    {job.required_skills?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.required_skills.slice(0, 5).map(skill => (
          <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 font-mono">
            {skill}
          </span>
        ))}
        {job.required_skills.length > 5 && (
          <span className="text-xs text-white/25">+{job.required_skills.length - 5} more</span>
        )}
      </div>
    )}

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      <span className="text-white/20 text-xs flex items-center gap-1">
        <Clock size={11} /> Recently posted
      </span>
      <button className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">
        View details <ChevronRight size={13} />
      </button>
    </div>
  </motion.div>
)

export default function JobsPage() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  const fetchJobs = async (q = '', type = 'all') => {
    setLoading(true)
    try {
      const params = {}
      if (q.trim())    params.q        = q.trim()
      if (type !== 'all') params.job_type = type
      const { data } = await api.get('/api/jobs/', { params })
      setJobs(data.jobs || [])
    } catch {
      toast.error('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchJobs(search, filter), 350)
    return () => clearTimeout(t)
  }, [search, filter])

  const TYPES = ['all', 'full-time', 'internship', 'part-time']

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Job Board</h1>
        <p className="text-white/40">Browse {jobs.length} active openings matched to your profile.</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-field pl-10"
            placeholder="Search by title, company, or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/30 flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all capitalize ${
                  filter === t
                    ? 'bg-brand-600/20 text-brand-400 border-brand-500/40'
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center h-48"
          >
            <Loader2 size={28} className="animate-spin text-brand-400" />
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl p-16 border border-white/5 text-center"
          >
            <Briefcase size={36} className="text-white/15 mx-auto mb-4" />
            <p className="text-white/40 font-medium mb-1">No jobs found</p>
            <p className="text-white/25 text-sm">Try a different search or clear the filter.</p>
          </motion.div>
        ) : (
          <motion.div key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-5"
          >
            {jobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
