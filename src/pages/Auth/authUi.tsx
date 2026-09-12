// src/pages/Auth/authUi.tsx
// Form pieces shared by the sign-in, sign-up, recovery and account screens.
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { loginWith } from '../../services/auth'

export const fieldCls =
  'w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.95rem] text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-4)] focus:border-white/30'

export function TextField({ label, hint, ...input }: { label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="kicker mb-2 block">{label}</span>
      <input {...input} className={fieldCls} />
      {hint && <span className="mt-1.5 block text-[0.76rem] text-[color:var(--ink-4)]">{hint}</span>}
    </label>
  )
}

export function PasswordField({ label, hint, ...input }: { label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false)
  return (
    <label className="block">
      <span className="kicker mb-2 block">{label}</span>
      <span className="relative block">
        <input {...input} type={shown ? 'text' : 'password'} className={`${fieldCls} pr-16`} />
        <button
          type="button"
          onClick={() => setShown(s => !s)}
          className="f-mono absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
          aria-label={shown ? 'Hide password' : 'Show password'}
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </span>
      {hint && <span className="mt-1.5 block text-[0.76rem] text-[color:var(--ink-4)]">{hint}</span>}
    </label>
  )
}

export function SubmitButton({ busy, children, disabled }: { busy?: boolean; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" disabled={busy || disabled} className="pill pill-light h-12 w-full disabled:cursor-not-allowed disabled:opacity-50">
      {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />}
      {children}
    </button>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'border-white/[0.1] bg-white/[0.03] text-[color:var(--ink-2)]',
    error: 'border-white/25 bg-white/[0.06] text-[color:var(--ink)]',
    success: 'border-white/20 bg-white/[0.05] text-[color:var(--ink)]',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-[0.86rem] leading-relaxed ${styles[tone]}`}>
      {children}
    </div>
  )
}

const OAUTH_LABEL = { google: 'Continue with Google', github: 'Continue with GitHub' } as const

const OAUTH_ICON = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.35-1 2.5-2.1 3.27v2.7h3.4c2-1.85 3.15-4.57 3.15-7.82 0-.66-.06-1.3-.16-1.9z" opacity=".9" />
      <path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.4-2.7c-.94.63-2.14 1-3.22 1-2.47 0-4.57-1.67-5.32-3.9H3.15v2.44A9.99 9.99 0 0 0 12 22z" opacity=".7" />
      <path fill="currentColor" d="M6.68 13.97a6 6 0 0 1 0-3.94V7.6H3.15a10 10 0 0 0 0 8.82l3.53-2.45z" opacity=".5" />
      <path fill="currentColor" d="M12 6.16c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2 9.99 9.99 0 0 0 3.15 7.6l3.53 2.44C7.43 7.82 9.53 6.16 12 6.16z" opacity=".8" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  ),
}

/** Google / GitHub buttons, shown only for the providers the backend has configured. */
export function OAuthButtons({ providers }: { providers: ('google' | 'github')[] }) {
  if (providers.length === 0) return null
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="kicker">or</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        {providers.map(provider => (
          <button key={provider} type="button" onClick={() => loginWith(provider)} className="pill pill-dark h-12 w-full">
            {OAUTH_ICON[provider]}
            {OAUTH_LABEL[provider]}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Reads the one-time token from a link like /auth/reset?token=... */
export function useLinkToken(): string {
  return new URLSearchParams(window.location.search).get('token') || ''
}
