// src/pages/Auth/ResetPasswordPage.tsx
// The page a reset email links to: choose a new password, then straight in.
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthError, resetPassword } from '../../services/auth'
import { AuthLayout } from './AuthLayout'
import { Notice, PasswordField, SubmitButton, useLinkToken } from './authUi'

export default function ResetPasswordPage() {
  const token = useLinkToken()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      setError(new AuthError('mismatch', 'The two passwords do not match.', 0))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await resetPassword(token, password)
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
      kicker="Account recovery"
      title={
        <>
          Choose a new <span className="f-serif italic">password</span>
        </>
      }
      subtitle="After this, every other session on your account is signed out."
    >
      {linkDead ? (
        <div className="flex flex-col gap-4">
          <Notice tone="error">
            {token ? error?.message : 'This reset link is incomplete. Ask for a new one.'}
          </Notice>
          <Link to="/auth/forgot" className="pill pill-light h-12 w-full">
            Send a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <PasswordField
            label="New password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="At least 10 characters."
          />
          <PasswordField
            label="Repeat it"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {error && <Notice tone="error">{error.message}</Notice>}
          <SubmitButton busy={busy}>Save and sign in</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}
