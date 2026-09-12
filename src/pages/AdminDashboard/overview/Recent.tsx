// src/pages/AdminDashboard/overview/Recent.tsx
// The latest intents (each opens its trace) and the latest admin actions.
import { Link } from 'react-router-dom'
import type { AuditEntry, RecentIntent } from '../../../services/adminService'
import { Section, DataTable, StatusBadge, timeAgo, fmtUsd, type Column } from '../shared'
import { routeLabel } from '../format'

const INTENT_COLUMNS: Column<RecentIntent>[] = [
  { key: 'command', header: 'Command', render: r => <span className="block max-w-[220px] truncate text-[color:var(--ink)]">{r.command || '-'}</span> },
  { key: 'route', header: 'Route', render: r => <span className="whitespace-nowrap">{routeLabel(r.from_chain, r.to_chain)}</span> },
  { key: 'tokens', header: 'Tokens', render: r => <span className="f-mono whitespace-nowrap text-[0.78rem]">{r.from_token || '?'} → {r.to_token || '?'}</span> },
  { key: 'volume_usd', header: 'Volume', align: 'right', render: r => <span className="f-mono">{fmtUsd(r.volume_usd)}</span> },
  { key: 'selected_provider', header: 'Provider', render: r => r.selected_provider || '-' },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'created_at', header: 'When', render: r => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{timeAgo(r.created_at)}</span> },
  {
    key: 'trace',
    header: '',
    align: 'right',
    render: r => (
      <Link to={`/dashboard/admin/traces?trace=${encodeURIComponent(r.id)}`} className="text-[0.78rem] text-[color:var(--ink-2)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
        Trace
      </Link>
    ),
  },
]

export function RecentIntents({ rows }: { rows: RecentIntent[] }) {
  return (
    <Section
      title="Recent intents"
      subtitle="The last eight requests through the pipeline"
      right={
        <Link to="/dashboard/admin/transactions" className="pill pill-dark h-9">
          All transactions
        </Link>
      }
    >
      <DataTable
        columns={INTENT_COLUMNS}
        rows={rows}
        rowKey={r => r.id}
        empty={<p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No intents have been processed yet.</p>}
      />
    </Section>
  )
}

export function RecentAudit({ rows }: { rows: AuditEntry[] }) {
  return (
    <Section
      title="Recent admin activity"
      subtitle="The last eight audited actions"
      right={
        <Link to="/dashboard/admin/audit" className="pill pill-dark h-9">
          Audit log
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No admin actions recorded yet.</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((r, i) => (
            <li key={`${r.action}-${r.created_at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/[0.06] py-2.5 text-[0.84rem] last:border-b-0">
              <span className="min-w-0">
                <span className="f-mono text-[0.76rem] text-[color:var(--ink)]">{r.action}</span>
                {r.target && <span className="ml-2 break-all text-[color:var(--ink-4)]">{r.target}</span>}
              </span>
              <span className="whitespace-nowrap text-[0.76rem] text-[color:var(--ink-4)]">
                {r.actor || 'system'} · {timeAgo(r.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
