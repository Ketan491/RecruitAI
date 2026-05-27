/**
 * Landing page — the first thing visitors see.
 * Sections: Hero, Features, Stats, How It Works, CTA
 */
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Zap, Target, Mic, Lightbulb, ArrowRight, CheckCircle,
  FileText, ChevronDown, Sparkles,
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'Smart Resume Analysis', desc: 'AI extracts skills, experience, and keywords from your PDF resume in seconds.', color: 'brand' },
  { icon: Target, title: 'ATS Score Checker', desc: 'See exactly how your resume performs against any job description with NLP matching.', color: 'purple' },
  { icon: Mic, title: 'Interview Simulator', desc: 'Practice interviews with AI — get real-time feedback on filler words and confidence.', color: 'cyan' },
  { icon: Lightbulb, title: 'Career Recommendations', desc: 'Personalized job role suggestions and course recommendations based on your skills.', color: 'pink' },
]

const stats = [
  { value: '15,000+', label: 'Resumes Analyzed' },
  { value: '94%', label: 'Accuracy Rate' },
  { value: '3,200+', label: 'Jobs Matched' },
  { value: '8,500+', label: 'Happy Users' },
]

const colorMap = {
  brand: 'from-brand-600/20 border-brand-500/20 text-brand-400',
  purple: 'from-purple-600/20 border-purple-500/20 text-purple-400',
  cyan: 'from-cyan-600/20 border-cyan-500/20 text-cyan-400',
  pink: 'from-pink-600/20 border-pink-500/20 text-pink-400',
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-purple rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">RecruitAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How it Works', 'Pricing'].map(item => (
              <a key={item} href="#" className="text-white/50 hover:text-white text-sm transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-grid">
        {/* Animated blobs */}
        <div className="blob blob-1 w-96 h-96 top-20 -left-20" />
        <div className="blob blob-2 w-80 h-80 bottom-20 right-10" />
        <div className="blob blob-3 w-72 h-72 top-1/2 left-1/2 -translate-x-1/2" />

        <motion.div style={{ y: heroY }} className="relative text-center max-w-5xl mx-auto px-6 pt-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass glow-border rounded-full px-4 py-2 mb-8"
          >
            <Sparkles size={14} className="text-brand-400" />
            <span className="text-xs font-medium text-white/70">AI-Powered Recruitment Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-bold text-5xl md:text-7xl leading-tight text-white mb-6"
          >
            Land your dream job{' '}
            <span className="heading-gradient">faster with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your resume. Get an ATS score. Practice interviews with AI.
            Discover your ideal career path. All in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base justify-center">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost flex items-center gap-2 text-base justify-center">
              View demo
            </Link>
          </motion.div>

          {/* Hero dashboard preview — simplified card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="glass glow-border rounded-3xl p-6 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-white/30 text-xs font-mono">resume-analysis.ai</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'ATS Score', value: '87%', color: 'text-emerald-400' },
                { label: 'Skills Found', value: '14', color: 'text-brand-400' },
                { label: 'Match Level', value: 'Strong', color: 'text-purple-400' }
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-display font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-white/40 text-xs mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {['React', 'Python', 'FastAPI', 'MongoDB', 'Docker'].map((skill, i) => (
                <div key={skill} className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${70 + i * 6}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <span className="text-white/50 text-xs w-12 text-right font-mono">{70 + i * 6}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display font-bold text-4xl text-white mb-1">{s.value}</div>
                <div className="text-white/40 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-section">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4 border border-white/10"
          >
            <Sparkles size={14} className="text-brand-400" />
            <span className="text-xs text-white/60">Everything you need</span>
          </motion.div>
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Built for serious job seekers
          </h2>
          <p className="text-white/40 max-w-lg mx-auto">
            No fluff. Just powerful AI tools that actually help you get interviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`glass rounded-2xl p-6 border bg-gradient-to-br ${colorMap[f.color]} card-hover cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[f.color]} border flex items-center justify-center mb-4`}>
                <f.icon size={22} className={colorMap[f.color].split(' ').pop()} />
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass glow-border rounded-3xl p-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap size={30} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Ready to get hired smarter?
          </h2>
          <p className="text-white/50 mb-8 text-lg">
            Join thousands of candidates who've boosted their interview chances with RecruitAI.
          </p>
          <Link to="/signup" className="btn-primary text-base inline-flex items-center gap-2">
            Create free account <ArrowRight size={18} />
          </Link>
          <p className="text-white/30 text-sm mt-4">No credit card required. Free forever.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-600 to-accent-purple rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white/70 text-sm">RecruitAI</span>
          </div>
          <p className="text-white/30 text-xs">
            © 2024 RecruitAI. Built with React + FastAPI.
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
