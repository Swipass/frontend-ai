import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAvailableProviders, loginWith } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'
import { Wordmark } from '../../components/Logo'

export default function AuthPage() {
  const [available, setAvailable] = useState<string[]>([])
  const [checking, setChecking] = useState(true)
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAvailableProviders().then((p) => {
      setAvailable(p)
      setChecking(false)
    })
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard/developer', { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  const providers: { id: 'google' | 'github'; label: string; icon: JSX.Element }[] = [
    {
      id: 'google',
      label: 'Continue with Google',
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
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
        </svg>
      ),
    },
  ]

  const shown = providers.filter((p) => available.includes(p.id))

  return (
    <div className="min-h-screen flex items-center justify-center bg-deepest-dark font-body p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-dark-grey-1 border border-dark-grey-3 rounded-xl p-6 sm:p-8 text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2 font-display text-lg font-extrabold text-almost-white tracking-tighter mb-2">
          <Wordmark textClassName="text-lg" />
        </Link>
        <p className="text-light-grey-1 text-sm mb-8">Sign in to your developer dashboard</p>

        <div className="space-y-3">
          {checking ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-mid-grey border-t-almost-white rounded-full animate-spin" />
            </div>
          ) : shown.length === 0 ? (
            <p className="text-light-grey-1 text-xs py-4">
              Sign-in is not configured yet. Add Google or GitHub OAuth credentials to enable it.
            </p>
          ) : (
            shown.map((p) => (
              <button
                key={p.id}
                onClick={() => loginWith(p.id)}
                className="w-full flex items-center justify-center gap-3 bg-dark-grey-2 border border-mid-grey rounded-lg py-3 px-4 text-light-grey-3 font-display text-sm font-semibold hover:bg-dark-grey-3 hover:border-light-grey-1 transition-all duration-200"
              >
                {p.icon}
                {p.label}
              </button>
            ))
          )}
        </div>

        <p className="mt-8 text-[0.7rem] leading-relaxed text-light-grey-1">
          End users never sign in. Wallet connection is all that is needed to use the app.
          Accounts are only for developers and administrators.
        </p>

        <div className="mt-6 p-3 border border-dark-grey-3 rounded-md">
          <p className="text-xs text-light-grey-1">
            Need help? <Link to="/docs" className="text-light-grey-3 underline">Read the docs</Link>
          </p>
        </div>
        <Link to="/" className="inline-block w-full text-center mt-4 text-light-grey-1 text-sm hover:text-light-grey-3 transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}
