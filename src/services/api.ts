import axios from 'axios'
import { API_URL } from '../config'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export const getAccessToken = (): string | null => {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return null
    return JSON.parse(stored)?.state?.accessToken ?? null
  } catch { return null }
}

export const getRefreshToken = (): string | null => {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return null
    return JSON.parse(stored)?.state?.refreshToken ?? null
  } catch { return null }
}

// Interceptor petición: añade Bearer token
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor respuesta: renueva token en 401
let isRefreshing = false
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => error ? p.reject(error) : p.resolve(token!))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { authService } = await import('./authService')
        const { useAuthStore } = await import('../store/authStore')
        const tokens = await authService.refresh(getRefreshToken() ?? '')
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
        processQueue(null, tokens.accessToken)
        original.headers.Authorization = `Bearer ${tokens.accessToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        const { useAuthStore } = await import('../store/authStore')
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)