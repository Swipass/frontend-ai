// src/pages/AdminDashboard/Team.tsx
// Staff role management and read-only view-as-developer.
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, Modal, selectCls, fmtUsd } from './shared'

const STAFF_ROLES = ['', 'developer', 'staff_support', 'staff_finance', 'staff_moderator', 'super_admin']

export default function Team() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<any | null>(null)
  const [viewData, setViewData] = useState<any | null>(null)

  const load = () => {
    setLoading(true)
    adminService.listUsers(200).then((d) => setUsers(d.users || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const setRole = async (id: string, role: string) => {
    await adminService.updateUserRole(id, role || null)
    load()
  }

  const openView = async (u: any) => {
    setViewing(u)
    setViewData(null)
    try {
      setViewData(await adminService.viewAsDeveloper(u.id))
    } catch {
      setViewData({ error: true })
    }
  }

  if (loading) return <><PageTitle title="Team & Roles" /><Loading /></>

  const staff = users.filter((u) => u.role && u.role !== 'developer')
  const others = users.filter((u) => !u.role || u.role === 'developer')

  return (
    <div>
      <PageTitle title="Team & Roles" subtitle="Assign staff roles and inspect developer accounts (read-only)." />

      <div className="dash-card mb-6">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-3">Staff</div>
        {staff.length === 0 ? (
          <p className="text-light-grey-1 text-sm">No staff roles assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((u) => (
              <Row key={u.id} u={u} onRole={setRole} onView={openView} />
            ))}
          </div>
        )}
      </div>

      <div className="dash-card">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-3">All accounts</div>
        {others.length === 0 ? (
          <EmptyState title="No other accounts" />
        ) : (
          <div className="space-y-2">
            {others.map((u) => (
              <Row key={u.id} u={u} onRole={setRole} onView={openView} />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!viewing} title={`Viewing ${viewing?.email || ''}`} onClose={() => setViewing(null)} wide>
        {!viewData ? (
          <Loading />
        ) : viewData.error ? (
          <p className="text-light-grey-1 text-sm">Could not load this account.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-light-grey-2">
              Role: <span className="text-light-grey-3">{viewData.user?.role || 'none'}</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-light-grey-1">Projects</div>
            {(viewData.projects || []).length === 0 ? (
              <p className="text-light-grey-1 text-sm">No projects.</p>
            ) : (
              <div className="space-y-2">
                {viewData.projects.map((p: any) => (
                  <div key={p.id} className="flex justify-between border border-dark-grey-3 rounded px-3 py-2 text-sm">
                    <span className="text-light-grey-3">{p.name}</span>
                    <span className="text-light-grey-1">
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

function Row({ u, onRole, onView }: { u: any; onRole: (id: string, r: string) => void; onView: (u: any) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-dark-grey-3 rounded px-3 py-2">
      <div className="min-w-0">
        <div className="text-sm text-light-grey-3 truncate">{u.email}</div>
        <div className="text-[0.7rem] text-light-grey-1 truncate">{u.id}</div>
      </div>
      <div className="flex items-center gap-2">
        <select className={selectCls} value={u.role || ''} onChange={(e) => onRole(u.id, e.target.value)}>
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>{r || 'none'}</option>
          ))}
        </select>
        <button onClick={() => onView(u)} className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">View</button>
      </div>
    </div>
  )
}
