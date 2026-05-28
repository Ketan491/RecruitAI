/**
 * Root component — routing, protected routes, and page transitions.
 * AnimatePresence must receive location.key so it detects route changes.
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { useAuth } from './context/AuthContext'
import CustomCursor from './components/cursor/CustomCursor'

import LandingPage      from './pages/LandingPage'
import LoginPage        from './pages/LoginPage'
import SignupPage       from './pages/SignupPage'
import Dashboard        from './pages/Dashboard'
import ResumeUpload     from './pages/ResumeUpload'
import ATSScore         from './pages/ATSScore'
import InterviewAnalyzer from './pages/InterviewAnalyzer'
import Recommendations  from './pages/Recommendations'
import HRDashboard      from './pages/HRDashboard'
import Analytics        from './pages/Analytics'
import Profile          from './pages/Profile'
import Settings         from './pages/Settings'
import JobsPage         from './pages/JobsPage'

const LoadingScreen = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-white/40 text-sm font-mono">Loading...</p>
    </div>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

const HRRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'hr') return <Navigate to="/dashboard" replace />
  return children
}

// Redirect already-logged-in users away from login/signup
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={user.role === 'hr' ? '/hr' : '/dashboard'} replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <CustomCursor />
      {/* key=location.pathname is required — tells AnimatePresence when route changed */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

          {/* User-protected */}
          <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume"         element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/ats"            element={<ProtectedRoute><ATSScore /></ProtectedRoute>} />
          <Route path="/interview"      element={<ProtectedRoute><InterviewAnalyzer /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/jobs"           element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings"       element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* HR-only */}
          <Route path="/hr"            element={<HRRoute><HRDashboard /></HRRoute>} />
          <Route path="/hr/analytics"  element={<HRRoute><Analytics /></HRRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <SpeedInsights />
      <VercelAnalytics />
    </>
  )
}
