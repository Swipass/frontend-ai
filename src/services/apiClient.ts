// src/services/apiClient.ts
import axios from 'axios'
import { getClerkToken } from './clerkToken'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
    // Optional: keep only if you need debugging
    // console.log('[API] Attached token to request:', config.url)
  }
  // Remove the warning – it's expected on first load
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default apiClient