// src/pages/Auth/VerifyEmailPage.tsx
// The page a confirmation email links to. It asks for the password chosen at
// sign-up, so only someone who has both the inbox and the password can bring
// the account to life.
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthError, verifyEmail } from '../../services/auth'
import { AuthLayout } from './AuthLayout'
import { Notice, PasswordField, SubmitButton, useLinkToken } from './authUi'

export default function VerifyEmailPage() {
  const token = useLinkToken()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyEmail(token, password)
      navigate('/dashboard/developer', { replace: true })
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('error', 'Something went wrong. Try again.', 0))
    } finally {
      setBusy(false)
    }
  }

  const linkDead = !token || error?.code === 'invalid_link'

  return (
    <AuthLayout
      kicker="Almost there"
      title={
        <>
          Confirm your <span className="f-serif italic">email</span>
        </>
      }
      subtitle="Enter the password you chose when you signed up. It confirms the account is yours before it goes live."
    >
      {linkDead ? (
        <div className="flex flex-col gap-4">
          <Notice tone="error">
            {token ? error?.message : 'This confirmation link is incomplete.'} Sign in with your email to get a fresh one.
          </Notice>
          <Link to="/auth" className="pill pill-light h-12 w-full">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <PasswordField
            label="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <Notice tone="error">{error.message}</Notice>}
          <SubmitButton busy={busy}>Confirm and continue</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}
