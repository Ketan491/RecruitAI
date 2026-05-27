// Landing.jsx — Hero landing page with animations
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Target, Brain, Video, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: Brain,     title: 'AI Resume Parser',    desc: 'Instantly extract skills, experience, and keywords from any PDF resume using NLP.' },
  { icon: Target,    title: 'ATS Score Engine',    desc: 'Match your resume against job descriptions with intelligent cosine similarity scoring.' },
  { icon: Zap,       title: 'Smart Recommendations', desc: 'Get role suggestions and course recommendations tailored to your skill profile.' },
  { icon: Video,     title: 'Interview Analyzer',  desc: 'Practice with AI-powered speech analysis, filler word detection, and confidence scoring.' },
]

const STATS = [
  { value: '10K+', label: 'Candidates Placed' },
  { value: '95%',  label: 'ATS Accuracy'      },
  { value: '500+', label: 'Partner Companies' },
  { value: '4.9★', label: 'User Rating'       },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ zIndex: 1 }}>
      {/* Gradient orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none" />

      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">HireAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost">Sign In</button>
          <button onClick={() => navigate('/signup')} className="btn-primary">Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-16 pb-24 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 glass border border-cyan-500/20 rounded-full text-xs text-cyan-300 font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Recruitment Platform v1.0
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.06] mb-6 max-w-4xl mx-auto">
          Land Your Dream Job with{' '}
          <span className="grad-text">AI-Powered</span>{' '}
          Career Intelligence
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Upload your resume, get instant ATS scores, AI-personalized job recommendations,
          and practice interviews — all in one platform built for the modern job seeker.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/signup')}
            className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
            Start for Free <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')}
            className="btn-ghost text-base px-8 py-4">
            I have an account
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
          {STATS.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-2xl grad-text">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-6 pb-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-mono text-gray-600 uppercase tracking-widest mb-3">What We Do</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Everything you need to <span className="grad-text">get hired faster</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-hover p-6 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={20} className="text-cyan-400" />
              </div>
              <h3 className="font-display font-semibold text-white text-sm mb-2">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 pb-24 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-violet-600/5" />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Ready to transform your career?
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Join thousands of candidates who landed their dream roles using HireAI.
            </p>
            <button onClick={() => navigate('/signup')} className="btn-primary text-base px-10 py-4">
              Create Free Account
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.05] px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-cyan-400" />
          <span className="text-xs text-gray-600 font-mono">HireAI © 2025</span>
        </div>
        <p className="text-xs text-gray-700">Built with ❤ by students, for students</p>
      </footer>
    </div>
  )
}
