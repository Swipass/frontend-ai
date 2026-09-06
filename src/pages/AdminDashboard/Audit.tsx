// src/pages/AdminDashboard/Audit.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import { PageTitle, Loading, EmptyState } from './shared'

export default function Audit() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService
      .listAudit(200)
      .then(d => setRows(d.audit || d.entries || d.logs || d.items || d || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageTitle title="Audit Log" subtitle="Administrative actions across the platform." />

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="No audit entries" hint="Admin actions will be recorded here." />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Actor</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Target</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 text-light-grey-1 whitespace-nowrap">
                    {r.created_at || r.timestamp || r.time ? new Date(r.created_at || r.timestamp || r.time).toLocaleString() : '-'}
                  </td>
                  <td className="p-3 text-light-grey-3 break-all">{r.actor || r.actor_email || r.user_email || r.user_id || '-'}</td>
                  <td className="p-3 text-light-grey-2 uppercase tracking-wider text-xs">{r.action || r.event || '-'}</td>
                  <td className="p-3 text-light-grey-1 break-all">{r.target || r.target_id || r.resource || r.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
