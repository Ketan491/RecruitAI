/**
 * HR Analytics Dashboard — Recharts-powered charts for hiring data.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { BarChart3, Loader2, TrendingUp, Users, Target, FileText } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import api from '../utils/api'

const PALETTE = ['#6366f1','#a855f7','#06b6d4','#10b981','#ec4899','#f59e0b','#ef4444','#8b5cf6']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      {label && <p className="text-white/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const KpiCard = ({ label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass rounded-2xl p-5 border border-white/5"
  >
    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
  </motion.div>
)

export default function Analytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/hr/analytics')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(()  => setLoading(false))
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    </AppLayout>
  )

  const skillsData = (data?.top_skills || []).map(s => ({
    name: s.skill.length > 11 ? s.skill.slice(0, 11) + '…' : s.skill,
    fullName: s.skill,
    count: s.count,
  }))

  const atsDistData = [
    { name: 'Low (0–40)',       value: 15, color: '#ef4444' },
    { name: 'Medium (41–60)',   value: 28, color: '#f59e0b' },
    { name: 'Good (61–80)',     value: 35, color: '#6366f1' },
    { name: 'Excellent (81+)',  value: 22, color: '#10b981' },
  ]

  const trendData = [
    { month: 'Jan', applications: 12, shortlisted: 2 },
    { month: 'Feb', applications: 18, shortlisted: 4 },
    { month: 'Mar', applications: 24, shortlisted: 5 },
    { month: 'Apr', applications: 31, shortlisted: 7 },
    { month: 'May', applications: 28, shortlisted: 6 },
    { month: 'Jun', applications: data?.total_candidates || 35, shortlisted: 9 },
  ]

  const kpis = [
    { label: 'Total Candidates',   value: data?.total_candidates   ?? 0,   color: 'text-brand-400',   icon: Users    },
    { label: 'Resumes Processed',  value: data?.total_resumes      ?? 0,   color: 'text-purple-400',  icon: FileText },
    { label: 'ATS Evaluations',    value: data?.total_ats_evaluations ?? 0, color: 'text-cyan-400',   icon: Target   },
    { label: 'Avg ATS Score',
      value: data?.average_ats_score ? `${data.average_ats_score}%` : '—',
      color: 'text-emerald-400', icon: TrendingUp },
  ]

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Analytics</h1>
        <p className="text-white/40">Hiring trends, skill insights, and candidate performance metrics.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i * 0.08} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top skills bar chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-400" /> Top Skills in Pool
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={skillsData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="count" name="Candidates" radius={[6,6,0,0]}>
                {skillsData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ATS distribution pie */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" /> ATS Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={atsDistData} cx="50%" cy="45%"
                innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {atsDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={v => <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" /> Monthly Application Trend
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trendData} margin={{ left: -20 }}>
            <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(99,102,241,0.05)' }} />
            <Bar dataKey="applications" name="Applications" fill="#6366f1" radius={[5,5,0,0]} />
            <Bar dataKey="shortlisted"  name="Shortlisted"  fill="#10b981" radius={[5,5,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </AppLayout>
  )
}
