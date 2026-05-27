// AppLayout.jsx — Sidebar + main content shell
// Fix: SidebarContent moved outside render to prevent remount on state change
// Fix: mobile margin no longer applied on small screens
import { useState, useCallback } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Target, Lightbulb, Video,
  Users, BarChart3, User, Settings, LogOut, Menu, X,
  Zap, ChevronRight,
} from 'lucide-react'

const CANDIDATE_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/resume',    icon: FileText,        label: 'Resume'     },
  { to: '/ats',       icon: Target,          label: 'ATS Score'  },
  { to: '/recommend', icon: Lightbulb,       label: 'AI Advice'  },
  { to: '/interview', icon: Video,           label: 'Interview'  },
]
const HR_NAV = [
  { to: '/hr',        icon: Users,    label: 'Candidates' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics'  },
]
const BOTTOM_NAV = [
  { to: '/profile',  icon: User,     label: 'Profile'  },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

// ── NavItem — stable, not recreated on every render ─────────────────
function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
         ${isActive
           ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/10 border border-cyan-500/30 text-cyan-400'
           : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
         }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

// ── SidebarContent — defined OUTSIDE AppLayout so it's stable ────────
// Passing all needed values as props avoids hook-in-nested-component issues
function SidebarContent({ user, isHR, collapsed, onLogout }) {
  const navItems = isHR ? HR_NAV : CANDIDATE_NAV

  return (
    <div className="flex flex-col h-full p-3 gap-1">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-2 py-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-white text-lg tracking-tight">HireAI</span>
        )}
      </div>

      <div className="h-px bg-white/[0.06] mx-1 mb-2" />

      {/* Main nav */}
      <div className="flex-1 space-y-0.5">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="space-y-0.5">
        <div className="h-px bg-white/[0.06] mx-1 mb-2" />
        {BOTTOM_NAV.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* User badge */}
        {!collapsed && (
          <div className="glass rounded-xl px-3 py-2.5 mt-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-600 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── AppLayout ────────────────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout, isHR } = useAuth()
  const navigate    = useNavigate()
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const sidebarWidth = collapsed ? 64 : 220

  return (
    <div className="flex min-h-screen relative" style={{ zIndex: 1 }}>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full glass border-r border-white/[0.06] overflow-hidden"
        style={{ zIndex: 50 }}
      >
        <SidebarContent
          user={user} isHR={isHR}
          collapsed={collapsed}
          onLogout={handleLogout}
        />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#0D1526] border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronRight size={12} className={`transition-transform duration-250 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </motion.aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[220px] glass border-r border-white/[0.06] z-50 lg:hidden"
            >
              <SidebarContent
                user={user} isHR={isHR}
                collapsed={false}
                onLogout={handleLogout}
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ──
          Fix: margin only applied on lg+ screens to avoid hiding content on mobile
      ── */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 relative"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Responsive override: on mobile, ignore the marginLeft */}
        <style>{`@media (max-width: 1023px) { main { margin-left: 0 !important; } }`}</style>

        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 glass border-b border-white/[0.06]">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">HireAI</span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
