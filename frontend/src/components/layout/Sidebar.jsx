/**
 * App sidebar — navigation for authenticated users.
 * Shows different links based on user role (user vs HR).
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Target, Mic, Lightbulb, Briefcase,
  Users, BarChart3, User, Settings, LogOut, Zap, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'My Resume' },
  { to: '/ats', icon: Target, label: 'ATS Score' },
  { to: '/interview', icon: Mic, label: 'Interview AI' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/jobs', icon: Briefcase, label: 'Job Board' },
]

const hrLinks = [
  { to: '/hr', icon: Users, label: 'Candidates' },
  { to: '/hr/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomLinks = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70'} />
      <span>{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto text-brand-400/60" />}
    </motion.div>
  </Link>
)

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const links = user?.role === 'hr' ? hrLinks : userLinks

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-800/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-purple rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">RecruitAI</span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/5">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/40 text-xs capitalize">{user?.role || 'candidate'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavItem
            key={link.to}
            {...link}
            isActive={location.pathname === link.to}
          />
        ))}

        <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
          {bottomLinks.map(link => (
            <NavItem
              key={link.to}
              {...link}
              isActive={location.pathname === link.to}
            />
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  )
}
