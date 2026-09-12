// src/pages/AdminDashboard/overview/StatusStrip.tsx
// One line of platform state: live or paused, switches on, providers, chains.
import { Link } from 'react-router-dom'
import type { AdminDashboardData } from '../../../services/adminService'
import { StatusDot, Badge } from '../shared'

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="kicker">{label}</span>
      <span className="f-mono flex flex-wrap items-center gap-2 text-[0.84rem] text-[color:var(--ink-2)]">{children}</span>
    </div>
  )
}

export function StatusStrip({ status }: { status: AdminDashboardData['status'] }) {
  const paused = status.system_paused
  const switches = status.emergency_active || []
  return (
    <div className="dash-card mb-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      <Item label="Platform">
        <StatusDot ok={!paused} live={!paused} />
        {paused ? 'Paused' : 'Live'}
        {status.maintenance_message && (
          <Link to="/dashboard/admin/emergency" className="text-[0.74rem] text-[color:var(--ink-4)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
            message set
          </Link>
        )}
      </Item>
      <Item label="Switches on">
        {switches.length === 0 ? (
          <span className="text-[color:var(--ink-4)]">none</span>
        ) : (
          switches.map(s => (
            <Badge key={s} tone="strong" title={s}>
              {s.replace(/_/g, ' ')}
            </Badge>
          ))
        )}
      </Item>
      <Item label="Providers">
        {status.providers_active} active
        <span className="text-[color:var(--ink-4)]">
          {status.providers_available} available of {status.providers_total}
        </span>
      </Item>
      <Item label="Chains">
        {status.chains_active} active
        <span className="text-[color:var(--ink-4)]">of {status.chains_total}</span>
      </Item>
    </div>
  )
}
