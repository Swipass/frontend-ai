// src/pages/AdminDashboard/overview/Alerts.tsx
// What needs attention, most severe first, each with a way to act on it.
import { Link } from 'react-router-dom'
import type { DashboardAlert } from '../../../services/adminService'
import { AlertItem } from '../shared'

const ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 }

export function Alerts({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) return null
  const sorted = [...alerts].sort((a, b) => (ORDER[a.level] ?? 3) - (ORDER[b.level] ?? 3))
  return (
    <div className="mb-6 flex flex-col gap-2">
      {sorted.map(a => (
        <AlertItem
          key={a.code}
          level={a.level}
          title={a.title}
          detail={a.detail}
          action={
            a.action_path ? (
              <Link to={a.action_path} className="pill pill-dark h-9">
                Open
              </Link>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}
