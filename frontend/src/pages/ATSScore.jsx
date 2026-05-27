/**
 * ATS Score page — paste a job description and get a detailed match analysis.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Loader2, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Lightbulb, Clock, ChevronDown
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import ScoreRing from '../components/ui/ScoreRing'
import SkillBadge from '../components/ui/SkillBadge'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ATSScore() {
  const [resumeId, setResumeId] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Load user's latest resume ID
  useEffect(() => {
    api.get('/api/resume/my')
      .then(r => setResumeId(r.data.id))
      .catch(() => {})
    api.get('/api/ats/history')
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
  }, [])

  const handleScore = async (e) => {
    e.preventDefault()
    if (!resumeId) {
      toast.error('Upload your resume first before checking ATS score.')
      return
    }
    if (jobDesc.trim().length < 50) {
      toast.error('Job description is too short. Paste the full job posting.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/ats/score', {
        resume_id: resumeId,
        job_description: jobDesc,
        job_title: jobTitle || 'Untitled Role'
      })
      setResult(data)
      toast.success('ATS analysis complete!')
      // Refresh history
      const h = await api.get('/api/ats/history')
      setHistory(h.data.history || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Scoring failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Excellent Match', color: 'text-emerald-400' }
    if (s >= 60) return { label: 'Good Match', color: 'text-brand-400' }
    if (s >= 40) return { label: 'Partial Match', color: 'text-amber-400' }
    return { label: 'Low Match', color: 'text-red-400' }
  }

  const sampleJD = `We are looking for a skilled Full Stack Developer to join our team.

Requirements:
- 2+ years experience with React and Node.js
- Proficiency in Python or JavaScript
- Experience with MongoDB or PostgreSQL
- Knowledge of REST APIs and microservices
- Familiarity with Docker and AWS
- Strong understanding of Git and CI/CD pipelines
- Good communication and teamwork skills

Nice to have:
- TypeScript experience
- GraphQL knowledge
- Experience with Kubernetes`

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">ATS Score Checker</h1>
        <p className="text-white/40">Paste a job description and see how well your resume matches it.</p>
      </div>

      {!resumeId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-400 text-sm">
            No resume found. <a href="/resume" className="underline font-medium">Upload your resume</a> to check ATS scores.
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleScore} className="glass rounded-2xl p-6 border border-white/5 space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Job Title (optional)</label>
              <input className="input-field" placeholder="e.g. Senior React Developer"
                value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wide">Job Description</label>
                <button type="button" onClick={() => setJobDesc(sampleJD)}
                  className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
                  Use sample JD
                </button>
              </div>
              <textarea
                className="input-field resize-none h-52 leading-relaxed"
                placeholder="Paste the full job description here..."
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                required
              />
              <p className="text-white/20 text-xs mt-1">{jobDesc.length} characters — more detail = better accuracy</p>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !resumeId}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                : <><Target size={16} /> Calculate ATS Score</>}
            </motion.button>
          </form>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 glass rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setShowHistory(p => !p)}
                className="w-full flex items-center justify-between px-6 py-4 text-white/60 hover:text-white transition-colors text-sm"
              >
                <span className="flex items-center gap-2"><Clock size={14} /> Recent Scores ({history.length})</span>
                <ChevronDown size={14} className={`transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    {history.slice(0, 5).map((h, i) => (
                      <div key={h.id || i} className="flex items-center justify-between px-6 py-3 border-b border-white/5 last:border-0">
                        <span className="text-white/60 text-xs truncate max-w-[60%]">{h.job_title || 'Untitled'}</span>
                        <span className={`text-sm font-display font-bold ${getScoreLabel(h.overall_score).color}`}>
                          {h.overall_score}%
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-12 border border-white/5 flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                  <Target size={24} className="text-brand-400 absolute inset-0 m-auto" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Comparing resume...</p>
                  <p className="text-white/40 text-sm">Running NLP similarity analysis</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }} className="space-y-4">
                {/* Score overview */}
                <div className="glass rounded-2xl p-6 border border-white/5 flex items-center gap-6">
                  <ScoreRing score={Math.round(result.overall_score)} size={130} />
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{result.job_title}</p>
                    <p className={`text-2xl font-display font-bold mb-1 ${getScoreLabel(result.overall_score).color}`}>
                      {getScoreLabel(result.overall_score).label}
                    </p>
                    <div className="space-y-1">
                      {[
                        { label: 'Skill Match', value: result.skill_score },
                        { label: 'Text Similarity', value: result.text_similarity },
                        { label: 'Experience', value: result.experience_match },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <span className="text-white/40 w-24">{item.label}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                            />
                          </div>
                          <span className="text-white/60 font-mono w-8 text-right">{Math.round(item.value)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Matched skills */}
                {result.matched_skills?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-emerald-500/10">
                    <h3 className="text-emerald-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <CheckCircle size={14} /> Matched Skills ({result.matched_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.map(s => (
                        <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {result.missing_skills?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-red-500/10">
                    <h3 className="text-red-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <XCircle size={14} /> Missing Skills ({result.missing_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills.map(s => (
                        <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-white/5">
                    <h3 className="text-amber-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <Lightbulb size={14} /> AI Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                          className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                          {s}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 border border-white/5 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/10 flex items-center justify-center">
                  <Target size={28} className="text-brand-400/60" />
                </div>
                <p className="text-white/30 text-sm">Paste a job description and click calculate to see your ATS score.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  )
}
