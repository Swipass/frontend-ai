// src/services/apiClient.ts
import axios from 'axios'
import { getToken, clearToken } from './auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach our self-hosted OAuth session token as a Bearer token.
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken()
    }
    const msg =
      err.response?.data?.detail?.message ||
      err.response?.data?.message ||
      err.message ||
      'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default apiClient
