// src/services/auth.ts
// Self-hosted OAuth session handling (Google + GitHub). No Clerk, no passwords.
// The backend redirects back with the session token in the URL fragment; we
// capture it, store it, and send it as a Bearer token on API calls.
import { config } from '../config'

const TOKEN_KEY = 'swipass_session'

export interface AuthUser {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role?: string | null
  is_admin: boolean
  is_super_admin: boolean
}

export function captureTokenFromUrl(): void {
  const hash = window.location.hash
  if (hash.startsWith('#token=')) {
    const token = decodeURIComponent(hash.slice('#token='.length))
    if (token) localStorage.setItem(TOKEN_KEY, token)
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function loginWith(provider: 'google' | 'github'): void {
  window.location.href = `${config.apiUrl}/auth/login/${provider}`
}

export async function fetchAvailableProviders(): Promise<string[]> {
  try {
    const res = await fetch(`${config.apiUrl}/auth/providers`)
    if (!res.ok) return []
    const data = await res.json()
    return data.providers || []
  } catch {
    return []
  }
}

export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${config.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      if (res.status === 401) clearToken()
      return null
    }
    return (await res.json()) as AuthUser
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  const token = getToken()
  clearToken()
  try {
    await fetch(`${config.apiUrl}/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    // best effort; token is already cleared locally
  }
}
