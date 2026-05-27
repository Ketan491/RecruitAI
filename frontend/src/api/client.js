// api/client.js — Axios base instance
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Attach saved token on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('hireai_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hireai_token')
      localStorage.removeItem('hireai_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
