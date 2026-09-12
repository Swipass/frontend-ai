import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAvailableProviders, loginWith } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'
import { LogoMark } from '../../components/Logo'
import { useCursorHover } from '../../site/hooks'
import { SiteNav } from '../../site/SiteNav'
import '../../site/ui'
import '../../site/landing/hero.css'

const PROVIDERS: { id: 'google' | 'github'; label: string; variant: string; icon: JSX.Element }[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    variant: 'pill-light',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.35-1 2.5-2.1 3.27v2.7h3.4c2-1.85 3.15-4.57 3.15-7.82 0-.66-.06-1.3-.16-1.9z" opacity=".9" />
        <path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.4-2.7c-.94.63-2.14 1-3.22 1-2.47 0-4.57-1.67-5.32-3.9H3.15v2.44A9.99 9.99 0 0 0 12 22z" opacity=".7" />
        <path fill="currentColor" d="M6.68 13.97a6 6 0 0 1 0-3.94V7.6H3.15a10 10 0 0 0 0 8.82l3.53-2.45z" opacity=".5" />
        <path fill="currentColor" d="M12 6.16c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2 9.99 9.99 0 0 0 3.15 7.6l3.53 2.44C7.43 7.82 9.53 6.16 12 6.16z" opacity=".8" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    variant: 'pill-dark',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
]

export default function AuthPage() {
  const [available, setAvailable] = useState<string[]>([])
  const [checking, setChecking] = useState(true)
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  useCursorHover()

  useEffect(() => {
    fetchAvailableProviders().then((p) => {
      setAvailable(p)
      setChecking(false)
    })
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard/developer', { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  const shown = PROVIDERS.filter((p) => available.includes(p.id))

  return (
    <div className="site min-h-screen bg-[#0a0a0a]">
      <SiteNav />
      <main className="px-2 pb-4 pt-[4.75rem] sm:px-4 lg:px-6">
        <div className="hero-frame relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-[1440px] items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/[0.07] px-4 py-16 sm:rounded-[2.2rem]">
          <div className="hero-blob hero-blob-a" />
          <div className="hero-blob hero-blob-b" />

          <div className="glass hero-in relative w-full max-w-md p-7 text-center sm:p-10">
            <LogoMark size={44} className="mx-auto text-[color:var(--ink)] drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
            <div className="kicker mt-7">Developer access</div>
            <h1 className="mt-3 text-[2.2rem] font-light leading-tight tracking-[-0.04em] text-[color:var(--ink)]">
              Sign in to <span className="f-serif italic">Swipass</span>
            </h1>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">
              Manage your projects, API keys, usage and payouts.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {checking ? (
                <div className="flex justify-center py-5">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
              ) : shown.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.08] px-4 py-4 text-[0.82rem] text-[color:var(--ink-3)]">
                  Sign-in is not configured yet. Add Google or GitHub OAuth credentials to enable it.
                </p>
              ) : (
                shown.map((p) => (
                  <button key={p.id} type="button" onClick={() => loginWith(p.id)} className={`pill ${p.variant} h-12 w-full`}>
                    {p.icon}
                    {p.label}
                  </button>
                ))
              )}
            </div>

            <p className="mt-8 text-[0.78rem] leading-relaxed text-[color:var(--ink-4)]">
              End users never sign in: connecting a wallet is all the app needs. Accounts are only for developers and
              administrators.
            </p>
            <div className="mt-6 flex items-center justify-center gap-5 border-t border-white/[0.08] pt-5 text-[0.84rem]">
              <Link to="/docs" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Read the docs
              </Link>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <Link to="/" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
