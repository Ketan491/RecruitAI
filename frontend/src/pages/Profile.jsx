import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, MapPin, Linkedin, Github, Save, Loader2, Phone, FileText,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import SkillBadge from '../components/ui/SkillBadge'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/api/users/profile', form)
      setUser(prev => ({ ...prev, ...data.user }))
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">My Profile</h1>
        <p className="text-white/40">Manage your personal details and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/5 text-center lg:col-span-1"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center text-white font-display font-bold text-3xl mx-auto mb-4">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="font-display font-semibold text-xl text-white mb-1">{user?.name}</h2>
          <p className="text-white/40 text-sm mb-1">{user?.email}</p>
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 capitalize mb-4">
            {user?.role}
          </span>

          {user?.skills?.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-white/30 text-xs mb-2 uppercase tracking-wide">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.slice(0, 10).map(s => <SkillBadge key={s} skill={s} size="sm" />)}
                {user.skills.length > 10 && <span className="text-white/30 text-xs">+{user.skills.length - 10} more</span>}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <FileText size={14} className={user?.resume_uploaded ? 'text-emerald-400' : 'text-white/20'} />
              <span>{user?.resume_uploaded ? 'Resume uploaded' : 'No resume yet'}</span>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/5 lg:col-span-2"
        >
          <h3 className="font-display font-semibold text-lg text-white mb-5">Edit Details</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className="input-field pl-9" value={form.name} onChange={set('name')} placeholder="Your name" />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className="input-field pl-9" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input className="input-field pl-9" value={form.location} onChange={set('location')} placeholder="Mumbai, India" />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">Bio</label>
              <textarea className="input-field resize-none h-24" value={form.bio} onChange={set('bio')}
                placeholder="A short intro about yourself, your goals, and what you're building..." />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className="input-field pl-9" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/you" />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wide mb-2">GitHub URL</label>
                <div className="relative">
                  <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className="input-field pl-9" value={form.github} onChange={set('github')} placeholder="github.com/you" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  )
}
