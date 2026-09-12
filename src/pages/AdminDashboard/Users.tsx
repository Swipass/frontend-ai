// src/pages/AdminDashboard/Users.tsx
// Every account on the platform: search, filter, suspend/reactivate with a
// reason, force a sign-out, and a read-only view of a developer's projects.
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { adminService, type AdminUser } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Section, Modal, DataTable, Pager, Badge, SearchInput, fmtUsd, type Column } from './shared'
import { useLoad, useAdminRole } from './hooks'
import { Select, FilterBar, RowButton } from './components/Controls'
import { ReasonDialog } from './components/ReasonDialog'
import { ROLES, ROLE_LABELS, fullDate } from './format'

const PAGE_SIZE = 50
const ROLE_OPTIONS = [{ value: '', label: 'All roles' }, ...ROLES.filter(Boolean).map(r => ({ value: r, label: ROLE_LABELS[r] }))]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

type Pending = { kind: 'suspend' | 'reactivate'; user: AdminUser }

export default function Users() {
  const { isSuperAdmin, can } = useAdminRole()
  const [offset, setOffset] = useState(0)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [viewing, setViewing] = useState<AdminUser | null>(null)
  const [viewData, setViewData] = useState<any>(null)

  const fetcher = useCallback(
    () => adminService.searchUsers({ limit: PAGE_SIZE, offset, q: q || undefined, role: role || undefined, status: status || undefined }),
    [offset, q, role, status],
  )
  const { data, setData, loading, error, reload } = useLoad(fetcher, 'Could not load users')

  const rows = data?.users || []
  const total = data?.total ?? null

  const resetAndSet = (setter: (v: string) => void) => (v: string) => {
    setOffset(0)
    setter(v)
  }

  const updateRole = async (id: string, newRole: string) => {
    setData(prev => (prev ? { ...prev, users: prev.users.map(u => (u.id === id ? { ...u, role: newRole || null } : u)) } : prev))
    try {
      await adminService.updateUserRole(id, newRole || null)
      toast.success('Role updated')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update role')
      reload(true)
    }
  }

  const signOut = async (u: AdminUser) => {
    try {
      await adminService.signOutUser(u.id)
      toast.success(`${u.email} signed out everywhere`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sign out')
    }
  }

  const openView = async (u: AdminUser) => {
    setViewing(u)
    setViewData(null)
    try {
      setViewData(await adminService.viewAsDeveloper(u.id))
    } catch {
      setViewData({ error: true })
    }
  }

  const confirmChange = async (reason: string) => {
    if (!pending) return
    setBusy(true)
    try {
      const updated = await adminService.setUserActive(pending.user.id, pending.kind === 'suspend' ? false : true, reason)
      setData(prev => (prev ? { ...prev, users: prev.users.map(u => (u.id === updated.id ? updated : u)) } : prev))
      toast.success(pending.kind === 'suspend' ? 'User suspended' : 'User reactivated')
      setPending(null)
    } catch (e: any) {
      toast.error(e?.message || 'The change was not applied')
    } finally {
      setBusy(false)
    }
  }

  const COLUMNS: Column<AdminUser>[] = [
    {
      key: 'email',
      header: 'Account',
      render: u => (
        <div>
          <div className="text-[color:var(--ink)]">{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email}</div>
          <div className="text-[0.76rem] text-[color:var(--ink-4)]">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: u =>
        isSuperAdmin ? (
          <select
            value={u.role || ''}
            onChange={e => updateRole(u.id, e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-8 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 text-[0.72rem] text-[color:var(--ink-2)] outline-none [&_option]:bg-[#111111]"
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        ) : (
          <Badge>{ROLE_LABELS[u.role || ''] || u.role}</Badge>
        ),
    },
    { key: 'auth_method', header: 'Sign-in', render: u => <span className="capitalize text-[color:var(--ink-3)]">{u.auth_method || '-'}</span> },
    { key: 'email_verified', header: 'Verified', render: u => <Badge tone={u.email_verified ? 'neutral' : 'muted'}>{u.email_verified ? 'yes' : 'no'}</Badge> },
    { key: 'is_active', header: 'Status', render: u => <Badge tone={u.is_active === false ? 'muted' : 'strong'}>{u.is_active === false ? 'suspended' : 'active'}</Badge> },
    { key: 'projects', header: 'Projects', align: 'right', render: u => <span className="f-mono">{u.projects ?? 0}</span> },
    { key: 'created_at', header: 'Joined', render: u => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{fullDate(u.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: u => (
        <div className="flex justify-end gap-2">
          <RowButton onClick={() => openView(u)}>View</RowButton>
          {can('super_admin', 'staff_support') && (
            <RowButton onClick={() => signOut(u)}>Sign out</RowButton>
          )}
          {isSuperAdmin && (
            <RowButton
              onClick={() => setPending({ kind: u.is_active === false ? 'reactivate' : 'suspend', user: u })}
            >
              {u.is_active === false ? 'Reactivate' : 'Suspend'}
            </RowButton>
          )}
        </div>
      ),
    },
  ]

  if (loading && !data) return <><PageTitle title="Users" /><Loading /></>

  return (
    <div>
      <PageTitle title="Users" subtitle={total != null ? `${total.toLocaleString()} accounts` : undefined} />

      <FilterBar>
        <SearchInput value={q} onChange={resetAndSet(setQ)} placeholder="Search email or name" className="w-64" />
        <Select value={role} onChange={resetAndSet(setRole)} options={ROLE_OPTIONS} label="Role" />
        <Select value={status} onChange={resetAndSet(setStatus)} options={STATUS_OPTIONS} label="Status" />
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No users" hint={error || 'Nothing matches these filters.'} />
      ) : (
        <Section title="Accounts">
          <DataTable columns={COLUMNS} rows={rows} rowKey={u => u.id} />
          <Pager offset={offset} limit={PAGE_SIZE} total={total} count={rows.length} onChange={setOffset} />
        </Section>
      )}

      <ReasonDialog
        open={!!pending}
        title={pending?.kind === 'suspend' ? `Suspend ${pending.user.email}` : `Reactivate ${pending?.user.email}`}
        message={
          pending?.kind === 'suspend'
            ? 'They are signed out everywhere and cannot sign in again until reactivated.'
            : 'They can sign in again immediately.'
        }
        confirmLabel={pending?.kind === 'suspend' ? 'Suspend' : 'Reactivate'}
        busy={busy}
        onConfirm={confirmChange}
        onCancel={() => setPending(null)}
      />

      <Modal open={!!viewing} title={`Viewing ${viewing?.email || ''}`} onClose={() => setViewing(null)} wide>
        {!viewData ? (
          <Loading />
        ) : viewData.error ? (
          <p className="text-[0.86rem] text-[color:var(--ink-3)]">Could not load this account.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-[0.88rem] text-[color:var(--ink-2)]">
              Role: <span className="text-[color:var(--ink)]">{viewData.user?.role || 'none'}</span>
            </div>
            <div className="kicker">Projects</div>
            {(viewData.projects || []).length === 0 ? (
              <p className="text-[0.86rem] text-[color:var(--ink-3)]">No projects.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {viewData.projects.map((p: any) => (
                  <div key={p.id} className="flex justify-between rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-[0.86rem]">
                    <span className="text-[color:var(--ink)]">{p.name}</span>
                    <span className="text-[color:var(--ink-3)]">
                      {fmtUsd(p.total_earned)} earned / {fmtUsd(p.pending_balance)} pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
