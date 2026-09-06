// src/pages/DeveloperDashboard/Settings.tsx
import { useAuth } from '../../hooks/useAuth'
import { PageTitle, ConfirmDialog } from './shared'
import { useState } from 'react'

export default function Settings() {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth()
  const [confirmOut, setConfirmOut] = useState(false)

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const roleLabel = isSuperAdmin ? 'super_admin' : user?.role || 'developer'

  return (
    <div>
      <PageTitle title="Settings" subtitle="Your account details." />

      <div className="dash-card mb-6">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 pb-2 border-b border-dark-grey-3 mb-4">Account</div>
        <dl className="space-y-3 text-sm">
          {name && (
            <div className="flex justify-between gap-4">
              <dt className="text-light-grey-1">Name</dt>
              <dd className="text-light-grey-3 text-right">{name}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-light-grey-1">Email</dt>
            <dd className="text-light-grey-3 text-right break-all">{user?.email || '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-light-grey-1">Role</dt>
            <dd className="text-light-grey-3 text-right uppercase tracking-wider text-xs">{roleLabel}</dd>
          </div>
          {isAdmin && (
            <div className="flex justify-between gap-4">
              <dt className="text-light-grey-1">Admin access</dt>
              <dd className="text-light-grey-3 text-right">Enabled</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="dash-card">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 pb-2 border-b border-dark-grey-3 mb-4">Session</div>
        <p className="text-sm text-light-grey-1 mb-4">Sign out of the dashboard on this device.</p>
        <button
          onClick={() => setConfirmOut(true)}
          className="text-xs uppercase tracking-wider py-2 px-4 rounded border border-mid-grey text-light-grey-2 hover:bg-dark-grey-3 transition"
        >
          Log out
        </button>
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Log out"
        message="You will need to sign in again to access the dashboard."
        confirmLabel="Log out"
        onConfirm={logout}
        onCancel={() => setConfirmOut(false)}
      />
    </div>
  )
}
