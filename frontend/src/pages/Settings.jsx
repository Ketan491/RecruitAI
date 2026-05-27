import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Shield, Trash2, AlertTriangle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    logout()
    toast.success('Account deleted.')
    navigate('/')
  }

  const Section = ({ title, children }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/5 mb-4">
      <h3 className="font-display font-semibold text-white mb-5">{title}</h3>
      {children}
    </motion.div>
  )

  const ToggleRow = ({ icon: Icon, label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-white/40" />
        <div>
          <p className="text-white text-sm">{label}</p>
          <p className="text-white/30 text-xs">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-brand-600' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Settings</h1>
        <p className="text-white/40">Manage your account preferences.</p>
      </div>

      <div className="max-w-2xl">
        <Section title="Notifications">
          <ToggleRow icon={Bell} label="Email Notifications" desc="Get updates on new job matches and insights"
            value={notifications} onChange={setNotifications} />
        </Section>

        <Section title="Account Info">
          <div className="space-y-3">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role?.toUpperCase() },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/40 text-sm">{row.label}</span>
                <span className="text-white text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Danger Zone">
          <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium text-sm mb-1">Delete Account</p>
              <p className="text-white/40 text-xs mb-3">This will permanently delete your account and all your data.</p>
              <button onClick={handleDeleteAccount}
                className="flex items-center gap-2 text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors">
                <Trash2 size={12} /> Delete my account
              </button>
            </div>
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}
