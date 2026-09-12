// src/pages/Auth/ForgotPasswordPage.tsx
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthError, requestPasswordReset } from '../../services/auth'
import { AuthLayout } from './AuthLayout'
import { Notice, SubmitButton, TextField } from './authUi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      kicker="Account recovery"
      title={
        <>
          Reset your <span className="f-serif italic">password</span>
        </>
      }
      subtitle="Enter your account email and we will send you a link to choose a new password."
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <Notice tone="success">
            If an account exists for <span className="text-[color:var(--ink)]">{email.trim()}</span>, a reset link is on its
            way. It works for 30 minutes.
          </Notice>
          <Link to="/auth" className="pill pill-dark h-12 w-full">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
          />
          {error && <Notice tone="error">{error}</Notice>}
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
          <Link to="/auth" className="text-center text-[0.84rem] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
