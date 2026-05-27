/**
 * Recommendations page — AI-suggested job roles, skill gaps, and courses.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Lightbulb, Briefcase, BookOpen, TrendingUp, ExternalLink,
  Star, AlertCircle, Loader2, ChevronRight, Award
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import SkillBadge from '../components/ui/SkillBadge'
import api from '../utils/api'

export default function Recommendations() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/recommendations/').then(r => {
      setData(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const scoreColor = (s) => {
    if (s >= 75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    if (s >= 50) return 'text-brand-400 border-brand-500/30 bg-brand-500/10'
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
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
        <h1 className="font-display font-bold text-4xl text-white mb-2">AI Recommendations</h1>
        <p className="text-white/40">Personalized career insights based on your resume and skills.</p>
      </div>

      {data?.message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <AlertCircle size={18} className="text-amber-400" />
          <p className="text-amber-400 text-sm">{data.message}</p>
        </motion.div>
      )}

      {/* Recommended Roles */}
      <section className="mb-10">
        <h2 className="font-display font-semibold text-xl text-white mb-5 flex items-center gap-2">
          <Briefcase size={18} className="text-brand-400" /> Best-Fit Job Roles
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {data?.recommended_roles?.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 card-hover"
            >
              {i === 0 && (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-3">
                  <Star size={12} fill="currentColor" /> Top Match
                </div>
              )}
              <h3 className="font-display font-semibold text-white text-lg mb-1">{role.role}</h3>
              <p className="text-white/40 text-xs mb-4 font-mono">{role.avg_salary}</p>

              {/* Match score */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">Match Score</span>
                  <span className={`font-bold font-mono ${role.match_score >= 75 ? 'text-emerald-400' : role.match_score >= 50 ? 'text-brand-400' : 'text-amber-400'}`}>
                    {role.match_score}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-600 to-accent-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${role.match_score}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Your matched skills */}
              {role.your_skills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-white/30 text-xs mb-2">Skills you have</p>
                  <div className="flex flex-wrap gap-1">
                    {role.your_skills.slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {role.missing_skills?.length > 0 && (
                <div>
                  <p className="text-white/30 text-xs mb-2">Skills to add</p>
                  <div className="flex flex-wrap gap-1">
                    {role.missing_skills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Career Path */}
      {data?.career_path?.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-semibold text-xl text-white mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" /> Your Career Roadmap
          </h2>
          <div className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              {data.career_path.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                    i === 0 ? 'bg-brand-600/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-white/60 border-white/10'
                  }`}>
                    {step}
                  </div>
                  {i < data.career_path.length - 1 && (
                    <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-4">
              📍 Your current estimated level is at the beginning of this path. Upload a detailed resume for better accuracy.
            </p>
          </div>
        </section>
      )}

      {/* Missing Skills */}
      {data?.missing_skills?.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-semibold text-xl text-white mb-5 flex items-center gap-2">
            <Award size={18} className="text-cyan-400" /> Skills to Learn Next
          </h2>
          <div className="glass rounded-2xl p-6 border border-white/5">
            <p className="text-white/40 text-sm mb-4">
              These skills appear frequently in your matched job roles but aren't on your resume yet.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.missing_skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-sm px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Courses */}
      {data?.recommended_courses?.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-xl text-white mb-5 flex items-center gap-2">
            <BookOpen size={18} className="text-pink-400" /> Recommended Courses
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.recommended_courses.map((course, i) => (
              <motion.a
                key={course.title}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="glass rounded-2xl p-5 border border-white/5 card-hover block group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-lg">
                    {course.skill}
                  </span>
                  <ExternalLink size={14} className="text-white/20 group-hover:text-brand-400 transition-colors" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1 leading-snug">{course.title}</h3>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-white/40 text-xs">{course.platform}</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/40 text-xs">{course.duration}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  )
}
