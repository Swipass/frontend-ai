// src/pages/Account/AccountPage.tsx
// Account management for anyone signed in to a dashboard: profile, password
// (change, or set a first one on an OAuth-only account), sessions, and delete.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthError, changePassword, deleteAccount, signOutEverywhere, updateProfile } from '../../services/auth'
import { ConfirmDialog, PageTitle } from '../../site/dashboard/primitives'
import { Notice, PasswordField, SubmitButton, TextField } from '../Auth/authUi'

type Feedback = { tone: 'success' | 'error'; text: string } | null

const message = (err: unknown) => (err instanceof AuthError ? err.message : 'Something went wrong. Try again.')

function Section({ kicker, title, description, children }: { kicker: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="dash-card grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-10">
      <div>
        <div className="kicker">{kicker}</div>
        <h2 className="mt-3 text-[1.3rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{title}</h2>
        {description && <p className="mt-2 text-[0.84rem] leading-relaxed text-[color:var(--ink-3)]">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function AccountPage() {
  const { user, isSuperAdmin, refresh, logout } = useAuth()
  const navigate = useNavigate()

  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileNote, setProfileNote] = useState<Feedback>(null)

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordNote, setPasswordNote] = useState<Feedback>(null)

  const [sessionsNote, setSessionsNote] = useState<Feedback>(null)
  const [confirmSessions, setConfirmSessions] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteSecret, setDeleteSecret] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteNote, setDeleteNote] = useState<Feedback>(null)

  useEffect(() => {
    setFirst(user?.first_name || '')
    setLast(user?.last_name || '')
  }, [user?.first_name, user?.last_name])

  if (!user) return null
  const hasPassword = !!user.has_password
  const role = isSuperAdmin ? 'Super admin' : user.is_admin ? 'Staff' : 'Developer'
  const initial = (user.first_name?.[0] || user.email[0] || '?').toUpperCase()

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setProfileBusy(true)
    setProfileNote(null)
    try {
      await updateProfile(first, last)
      await refresh()
      setProfileNote({ tone: 'success', text: 'Profile saved.' })
    } catch (err) {
      setProfileNote({ tone: 'error', text: message(err) })
    } finally {
      setProfileBusy(false)
    }
  }

  const savePassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordNote(null)
    if (next !== repeat) {
      setPasswordNote({ tone: 'error', text: 'The two new passwords do not match.' })
      return
    }
    setPasswordBusy(true)
    try {
      await changePassword(hasPassword ? current : null, next)
      await refresh()
      setCurrent('')
      setNext('')
      setRepeat('')
      setPasswordNote({
        tone: 'success',
        text: hasPassword
          ? 'Password changed. Every other session was signed out.'
          : 'Password set. You can now sign in with your email too.',
      })
    } catch (err) {
      setPasswordNote({ tone: 'error', text: message(err) })
    } finally {
      setPasswordBusy(false)
    }
  }

  const revokeSessions = async () => {
    setConfirmSessions(false)
    setSessionsNote(null)
    try {
      await signOutEverywhere()
      setSessionsNote({ tone: 'success', text: 'Every other session was signed out. This one stays signed in.' })
    } catch (err) {
      setSessionsNote({ tone: 'error', text: message(err) })
    }
  }

  const removeAccount = async (event: FormEvent) => {
    event.preventDefault()
    setDeleteBusy(true)
    setDeleteNote(null)
    try {
      await deleteAccount(hasPassword ? { password: deleteSecret } : { confirm_email: deleteSecret })
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteNote({ tone: 'error', text: message(err) })
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div>
      <PageTitle title="Account" subtitle="Your profile, how you sign in, and your sessions." />

      <div className="flex flex-col gap-3">
        <Section kicker="Profile" title="Who you are" description="Shown in the dashboard and in messages from the team.">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f5f5f5,#8a8a8a_60%,#3a3a3a)] text-[1.2rem] font-medium text-[#0a0a0a]">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[1rem] text-[color:var(--ink)]">{user.email}</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <span className="chip text-[0.72rem]">{role}</span>
                <span className="chip text-[0.72rem]">{user.email_verified ? 'Email confirmed' : 'Email not confirmed'}</span>
              </div>
            </div>
          </div>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" value={first} onChange={e => setFirst(e.target.value)} autoComplete="given-name" maxLength={80} />
            <TextField label="Last name" value={last} onChange={e => setLast(e.target.value)} autoComplete="family-name" maxLength={80} />
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <button type="submit" disabled={profileBusy} className="pill pill-light h-11 disabled:opacity-50">
                {profileBusy ? 'Saving...' : 'Save profile'}
              </button>
              {profileNote && <Notice tone={profileNote.tone}>{profileNote.text}</Notice>}
            </div>
          </form>
        </Section>

        <Section
          kicker="Sign-in"
          title={hasPassword ? 'Change password' : 'Add a password'}
          description={
            hasPassword
              ? 'Changing it signs out every other session, and we email you to confirm.'
              : 'You sign in with Google or GitHub. Add a password to sign in with your email as well.'
          }
        >
          <form onSubmit={savePassword} className="flex max-w-md flex-col gap-4">
            {hasPassword && (
              <PasswordField label="Current password" required value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" />
            )}
            <PasswordField
              label="New password"
              required
              value={next}
              onChange={e => setNext(e.target.value)}
              autoComplete="new-password"
              hint="At least 10 characters."
            />
            <PasswordField label="Repeat new password" required value={repeat} onChange={e => setRepeat(e.target.value)} autoComplete="new-password" />
            {passwordNote && <Notice tone={passwordNote.tone}>{passwordNote.text}</Notice>}
            <SubmitButton busy={passwordBusy}>{hasPassword ? 'Change password' : 'Set password'}</SubmitButton>
          </form>
        </Section>

        <Section kicker="Sessions" title="Where you are signed in" description="Sessions last up to a week on each device.">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button type="button" onClick={() => setConfirmSessions(true)} className="pill pill-dark h-11">
                Sign out everywhere else
              </button>
              <button type="button" onClick={logout} className="pill pill-dark h-11">
                Log out on this device
              </button>
            </div>
            {sessionsNote && <Notice tone={sessionsNote.tone}>{sessionsNote.text}</Notice>}
          </div>
        </Section>

        <Section kicker="Danger zone" title="Delete account" description="Removes your account and its projects. API keys stop working at once.">
          {isSuperAdmin ? (
            <Notice>The platform owner account cannot be deleted from here.</Notice>
          ) : !deleting ? (
            <button type="button" onClick={() => setDeleting(true)} className="pill pill-dark h-11">
              Delete my account
            </button>
          ) : (
            <form onSubmit={removeAccount} className="flex max-w-md flex-col gap-4">
              {hasPassword ? (
                <PasswordField label="Password to confirm" required value={deleteSecret} onChange={e => setDeleteSecret(e.target.value)} autoComplete="current-password" />
              ) : (
                <TextField
                  label={`Type ${user.email} to confirm`}
                  required
                  value={deleteSecret}
                  onChange={e => setDeleteSecret(e.target.value)}
                  autoComplete="off"
                />
              )}
              {deleteNote && <Notice tone={deleteNote.tone}>{deleteNote.text}</Notice>}
              <div className="flex gap-2.5">
                <button type="button" onClick={() => setDeleting(false)} className="pill pill-dark h-11">
                  Cancel
                </button>
                <button type="submit" disabled={deleteBusy || !deleteSecret} className="pill pill-light h-11 disabled:opacity-50">
                  {deleteBusy ? 'Deleting...' : 'Delete permanently'}
                </button>
              </div>
            </form>
          )}
        </Section>
      </div>

      <ConfirmDialog
        open={confirmSessions}
        title="Sign out everywhere else"
        message="Every other browser and device signed in to your account is signed out. This one stays signed in."
        confirmLabel="Sign them out"
        onConfirm={revokeSessions}
        onCancel={() => setConfirmSessions(false)}
      />
    </div>
  )
}
