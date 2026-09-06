// src/pages/AdminDashboard/Users.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, selectCls, inputCls } from './shared'

const ROLES = ['', 'developer', 'staff_support', 'staff_finance', 'staff_moderator', 'super_admin']

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    adminService.listUsers().then(d => setUsers(d.users || d.items || [])).catch(() => setUsers([])).finally(() => setLoading(false))
  }, [])

  const updateRole = async (id: string, role: string) => {
    const prev = users
    setUsers(u => u.map(x => (x.id === id ? { ...x, role } : x)))
    try {
      await adminService.updateUserRole(id, role || null)
      toast.success('Role updated')
    } catch (e: any) {
      setUsers(prev)
      toast.error(e?.message || 'Failed to update role')
    }
  }

  const filtered = query
    ? users.filter(u => (u.email || '').toLowerCase().includes(query.toLowerCase()))
    : users

  return (
    <div>
      <PageTitle
        title="Users"
        subtitle={`${users.length} registered`}
        right={
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search email"
            className={inputCls + ' sm:w-64'}
          />
        }
      />

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users" hint={query ? 'No users match your search.' : 'No users have registered yet.'} />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-left">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 text-light-grey-3 break-all">{u.email}</td>
                  <td className="p-3 text-light-grey-1 uppercase tracking-wider text-xs">{u.role || 'user'}</td>
                  <td className="p-3 text-light-grey-1">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-3">
                    <select value={u.role || ''} onChange={e => updateRole(u.id, e.target.value)} className={selectCls}>
                      {ROLES.map(r => <option key={r} value={r}>{r || 'user'}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
