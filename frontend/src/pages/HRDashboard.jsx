/**
 * HR Dashboard — view, search, and rank all candidates.
 * Protected to HR role only.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, ChevronDown, ChevronUp, Award,
  FileText, Loader2, Tag,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import api from '../utils/api'

export default function HRDashboard() {
  const [candidates, setCandidates] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/hr/candidates'),
      api.get('/api/hr/analytics')
    ]).then(([cRes, aRes]) => {
      setCandidates(cRes.data.candidates)
      setFiltered(cRes.data.candidates)
      setStats(aRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Filter + sort whenever search/sort changes
  useEffect(() => {
    let result = [...candidates]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.skills?.some(s => s.toLowerCase().includes(q))
      )
    }
    result.sort((a, b) => {
      const aVal = a[sortBy] ?? 0
      const bVal = b[sortBy] ?? 0
      if (sortDir === 'desc') return bVal > aVal ? 1 : -1
      return aVal > bVal ? 1 : -1
    })
    setFiltered(result)
  }, [search, sortBy, sortDir, candidates])

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronDown size={12} className="text-white/20" />
    return sortDir === 'desc' ? <ChevronDown size={12} className="text-brand-400" /> : <ChevronUp size={12} className="text-brand-400" />
  }

  const scoreColor = (s) => {
    if (!s) return 'text-white/30'
    if (s >= 80) return 'text-emerald-400'
    if (s >= 60) return 'text-brand-400'
    if (s >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Candidate Pool</h1>
        <p className="text-white/40">Manage, rank, and search all registered candidates.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Candidates', value: stats?.total_candidates ?? 0, color: 'text-brand-400' },
          { label: 'Resumes Uploaded', value: stats?.total_resumes ?? 0, color: 'text-purple-400' },
          { label: 'ATS Evaluations', value: stats?.total_ats_evaluations ?? 0, color: 'text-cyan-400' },
          { label: 'Avg ATS Score', value: stats?.average_ats_score ? `${stats.average_ats_score}%` : '—', color: 'text-emerald-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 border border-white/5"
          >
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top skills */}
      {stats?.top_skills?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 border border-white/5 mb-6"
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
            <Tag size={12} /> Top Skills Across Candidates
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.top_skills.map(({ skill, count }) => (
              <span key={skill} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg font-mono">
                {skill} <span className="text-brand-400/50">×{count}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search + Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, email, or skill..."
              className="input-field pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-white/30 text-sm whitespace-nowrap">{filtered.length} results</span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-white/30 text-xs uppercase tracking-wide border-b border-white/5">
          <div className="col-span-3">Candidate</div>
          <div className="col-span-4">Top Skills</div>
          <button className="col-span-2 flex items-center gap-1 hover:text-white/60 transition-colors" onClick={() => toggleSort('skill_count')}>
            Skills <SortIcon field="skill_count" />
          </button>
          <button className="col-span-2 flex items-center gap-1 hover:text-white/60 transition-colors" onClick={() => toggleSort('best_ats_score')}>
            Best ATS <SortIcon field="best_ats_score" />
          </button>
          <div className="col-span-1 text-right">Resume</div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? 'No candidates match your search.' : 'No candidates yet.'}</p>
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/3 transition-colors"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600/40 to-accent-purple/40 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
                      {c.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.name}</p>
                      <p className="text-white/30 text-xs truncate">{c.email}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="flex flex-wrap gap-1">
                    {c.skills?.slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md font-mono">{s}</span>
                    ))}
                    {c.skills?.length > 3 && (
                      <span className="text-xs text-white/30">+{c.skills.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-white/60 text-sm font-mono">{c.skill_count}</span>
                </div>

                <div className="col-span-2">
                  <span className={`text-sm font-display font-bold ${scoreColor(c.best_ats_score)}`}>
                    {c.best_ats_score ? `${c.best_ats_score}%` : '—'}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  {c.resume_uploaded ? (
                    <FileText size={14} className="text-emerald-400" />
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AppLayout>
  )
}
