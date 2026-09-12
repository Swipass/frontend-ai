// src/pages/Auth/AuthPage.tsx
// Sign in and create an account for the dashboards: email + password, plus
// Google and GitHub whenever the backend has them configured.
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthError, fetchAuthOptions, resendVerification, signIn, signUp, type AuthOptions } from '../../services/auth'
import { AuthLayout } from './AuthLayout'
import { Notice, OAuthButtons, PasswordField, SubmitButton, TextField } from './authUi'

type Mode = 'signin' | 'signup'

const DASHBOARD = '/dashboard/developer'

function asAuthError(err: unknown): AuthError {
  return err instanceof AuthError ? err : new AuthError('error', 'Something went wrong. Try again.', 0)
}

export default function AuthPage() {
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('mode') === 'signup' ? 'signup' : 'signin'
  const [options, setOptions] = useState<AuthOptions | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAuthOptions().then(setOptions)
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate(DASHBOARD, { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  const switchMode = (next: Mode) => {
    setError(null)
    setResent(false)
    setSentTo(null)
    setParams(next === 'signup' ? { mode: 'signup' } : {}, { replace: true })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setResent(false)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        navigate(DASHBOARD, { replace: true })
      } else {
        const [first, ...rest] = name.trim().split(/\s+/)
        await signUp({ email: email.trim(), password, first_name: first || undefined, last_name: rest.join(' ') || undefined })
        setSentTo(email.trim())
      }
    } catch (err) {
      setError(asAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError(null)
    try {
      await resendVerification((sentTo || email).trim())
      setResent(true)
    } catch (err) {
      setError(asAuthError(err))
    }
  }

  if (sentTo) {
    return (
      <AuthLayout
        kicker="Check your inbox"
        title={
          <>
            Confirm your <span className="f-serif italic">email</span>
          </>
        }
        subtitle={
          <>
            We sent a confirmation link to <span className="text-[color:var(--ink)]">{sentTo}</span>. Open it to finish
            creating your account.
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {resent && <Notice tone="success">A new link is on its way.</Notice>}
          {error && <Notice tone="error">{error.message}</Notice>}
          <button type="button" onClick={resend} className="pill pill-dark h-12 w-full">
            Resend the link
          </button>
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="py-1 text-[0.84rem] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
          >
            Back to sign in
          </button>
        </div>
      </AuthLayout>
    )
  }

  const signupUnavailable = mode === 'signup' && options !== null && !options.emailDelivery

  return (
    <AuthLayout
      kicker="Developer access"
      title={
        mode === 'signin' ? (
          <>
            Sign in to <span className="f-serif italic">Swipass</span>
          </>
        ) : (
          <>
            Create your <span className="f-serif italic">account</span>
          </>
        )
      }
      subtitle={
        mode === 'signin'
          ? 'Manage your projects, API keys, usage and payouts.'
          : 'Get an API key and start routing intents. Free to start.'
      }
    >
      <div role="tablist" aria-label="Account" className="mb-6 grid grid-cols-2 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
        {(['signin', 'signup'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`rounded-full py-2 text-[0.84rem] transition-all duration-300 ${
              mode === m ? 'bg-[color:var(--ink)] text-[#0a0a0a]' : 'text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
            }`}
          >
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      {signupUnavailable ? (
        <Notice>
          Creating an account by email needs outgoing email, which is not available right now.{' '}
          {options?.providers.length ? 'Use Google or GitHub below.' : 'Try again later.'}
        </Notice>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <TextField label="Name (optional)" value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
          )}
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
          />
          <PasswordField
            label="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            hint={mode === 'signup' ? 'At least 10 characters.' : undefined}
          />
          {mode === 'signin' && (
            <div className="-mt-1 text-right">
              <Link to="/auth/forgot" className="text-[0.82rem] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]">
                Forgot password?
              </Link>
            </div>
          )}
          {error && (
            <Notice tone="error">
              {error.message}
              {error.code === 'email_not_verified' && (
                <>
                  {' '}
                  <button type="button" onClick={resend} className="underline underline-offset-4">
                    Send a new link
                  </button>
                </>
              )}
            </Notice>
          )}
          {resent && <Notice tone="success">If that account is waiting for confirmation, a new link is on its way.</Notice>}
          <SubmitButton busy={busy}>{mode === 'signin' ? 'Sign in' : 'Create account'}</SubmitButton>
        </form>
      )}

      {options && <OAuthButtons providers={options.providers} />}

      <p className="mt-6 text-center text-[0.76rem] leading-relaxed text-[color:var(--ink-4)]">
        End users never sign in: connecting a wallet is all the app needs. Accounts are for developers and administrators.
      </p>
    </AuthLayout>
  )
}
