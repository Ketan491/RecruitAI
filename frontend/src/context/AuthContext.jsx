/**
 * Global auth state — persisted in localStorage, restored on page refresh.
 * Uses /api/auth/me to validate the stored token without triggering the
 * global 401 interceptor (which would cause a redirect loop).
 */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount: restore session from stored token
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('token')
      if (!stored) { setLoading(false); return }

      // Attach header before the request so /me gets it
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`
      try {
        const { data } = await api.get('/api/auth/me')
        setUser(data)
        setToken(stored)
      } catch {
        // Token is expired / invalid — clean up silently, no redirect here
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
