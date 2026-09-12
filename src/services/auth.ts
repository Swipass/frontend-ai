// src/services/auth.ts
// Dashboard sessions: self-hosted Google/GitHub OAuth and email + password
// accounts. Either way the backend issues our own session token; we keep it in
// localStorage and send it as a Bearer token. OAuth hands it over in the URL
// fragment after the redirect; the email flows return it in the response body.
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
  has_password?: boolean
  email_verified?: boolean
}

export interface AuthOptions {
  providers: ('google' | 'github')[]
  /** Email + password sign-in is always offered. */
  password: boolean
  /** Whether the backend can send email, which sign-up and reset need. */
  emailDelivery: boolean
}

/** A failure the page can show as-is. `code` is the API's stable error code. */
export class AuthError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message)
  }
}

interface SessionResponse {
  token: string
  user: AuthUser
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

function storeSession(session: SessionResponse): AuthUser {
  localStorage.setItem(TOKEN_KEY, session.token)
  return session.user
}

async function call<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (options.auth && token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      method: options.method || 'POST',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new AuthError('network', 'Could not reach Swipass. Check your connection and try again.', 0)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail
    if (Array.isArray(detail)) {
      throw new AuthError('invalid_input', 'Check the details you entered and try again.', res.status)
    }
    if (detail && typeof detail === 'object') {
      const { error, message } = detail as { error?: string; message?: string }
      throw new AuthError(error || 'error', message || 'Something went wrong. Try again.', res.status)
    }
    throw new AuthError('error', typeof detail === 'string' ? detail : 'Something went wrong. Try again.', res.status)
  }
  return data as T
}

// ─── OAuth ────────────────────────────────────────────────────

export function loginWith(provider: 'google' | 'github'): void {
  window.location.href = `${config.apiUrl}/auth/login/${provider}`
}

export async function fetchAuthOptions(): Promise<AuthOptions> {
  try {
    const res = await fetch(`${config.apiUrl}/auth/providers`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    return { providers: data.providers || [], password: data.password !== false, emailDelivery: !!data.email_delivery }
  } catch {
    return { providers: [], password: true, emailDelivery: false }
  }
}

// ─── Email accounts ───────────────────────────────────────────

export function signUp(input: { email: string; password: string; first_name?: string; last_name?: string }) {
  return call<{ ok: boolean }>('/auth/signup', { body: input })
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  return storeSession(await call<SessionResponse>('/auth/signin', { body: { email, password } }))
}

export async function verifyEmail(token: string, password: string): Promise<AuthUser> {
  return storeSession(await call<SessionResponse>('/auth/verify-email', { body: { token, password } }))
}

export function resendVerification(email: string) {
  return call<{ ok: boolean }>('/auth/verify-email/resend', { body: { email } })
}

export function requestPasswordReset(email: string) {
  return call<{ ok: boolean }>('/auth/password/forgot', { body: { email } })
}

export async function resetPassword(token: string, password: string): Promise<AuthUser> {
  return storeSession(await call<SessionResponse>('/auth/password/reset', { body: { token, password } }))
}

// ─── Account management (signed in) ───────────────────────────

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

export function updateProfile(first_name: string, last_name: string) {
  return call<AuthUser>('/auth/me', { method: 'PATCH', body: { first_name, last_name }, auth: true })
}

/** Changes (or, on an OAuth-only account, sets) the password. Other sessions are signed out. */
export async function changePassword(current_password: string | null, new_password: string): Promise<AuthUser> {
  return storeSession(
    await call<SessionResponse>('/auth/password/change', { body: { current_password, new_password }, auth: true }),
  )
}

/** Signs out every session; this one continues on a fresh token. */
export async function signOutEverywhere(): Promise<AuthUser> {
  return storeSession(await call<SessionResponse>('/auth/sessions/revoke', { auth: true }))
}

export async function deleteAccount(input: { password?: string; confirm_email?: string }): Promise<void> {
  await call<{ ok: boolean }>('/auth/me/delete', { body: input, auth: true })
  clearToken()
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
