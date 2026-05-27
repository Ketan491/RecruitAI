import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Users, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/signup', form)
      login(data.user, data.access_token)
      toast.success('Account created! Welcome to RecruitAI 🎉')
      navigate(form.role === 'hr' ? '/hr' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center p-6">
      <div className="blob blob-1 w-80 h-80 top-10 right-10 opacity-20" />
      <div className="blob blob-2 w-72 h-72 bottom-10 left-10 opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-purple rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">RecruitAI</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create account</h1>
          <p className="text-white/40 text-sm">Start your AI-powered job search today</p>
        </div>

        <div className="glass glow-border rounded-3xl p-8">
          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-white/60 text-xs font-medium mb-3 uppercase tracking-wide">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', icon: User, label: 'Job Seeker' },
                { value: 'hr', icon: Users, label: 'HR / Recruiter' }
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    form.role === r.value
                      ? 'bg-brand-600/20 border-brand-500/50 text-brand-400'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <r.icon size={16} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Full Name</label>
              <input className="input-field" placeholder="Ketan Sharma" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
