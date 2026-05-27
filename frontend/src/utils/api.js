/**
 * Axios instance with base URL and auth interceptors.
 * The 401 redirect is suppressed for the /api/auth/me session-restore call
 * so AuthContext can cleanly clear the token without a redirect loop.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — but NOT for the session-restore ping (/api/auth/me)
// because AuthContext handles that case itself (clears token + stays on page).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const is401 = error.response?.status === 401
    const isSessionRestore = url.includes('/api/auth/me')

    if (is401 && !isSessionRestore) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
