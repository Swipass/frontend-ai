// src/pages/DeveloperDashboard/components/RecentRequests.tsx
// The last few requests across every project, each opening its trace.
import { Link } from 'react-router-dom'
import type { RecentIntent } from '../../../services/platformService'
import { Section, DataTable, StatusBadge, timeAgo, fmtUsd, type Column } from '../shared'
import { RouteCell } from './cells'

const COLUMNS: Column<RecentIntent>[] = [
  { key: 'project', header: 'Project', render: r => <span className="text-[color:var(--ink)]">{r.project_name}</span> },
  { key: 'route', header: 'Route', render: r => <RouteCell fromChain={r.from_chain} toChain={r.to_chain} fromToken={r.from_token} toToken={r.to_token} /> },
  { key: 'volume', header: 'Volume', align: 'right', className: 'f-mono', render: r => (r.volume_usd != null ? fmtUsd(r.volume_usd) : '-') },
  { key: 'provider', header: 'Provider', render: r => r.selected_provider || '-' },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'time', header: 'Time', className: 'f-mono whitespace-nowrap', render: r => timeAgo(r.created_at) },
]

export function RecentRequests({ rows, onOpen }: { rows: RecentIntent[]; onOpen: (row: RecentIntent) => void }) {
  return (
    <Section
      title="Recent requests"
      subtitle="Click a row for the stage-by-stage trace."
      right={
        <Link to="/dashboard/developer/requests" className="pill pill-dark h-9">
          All requests
        </Link>
      }
    >
      <DataTable
        columns={COLUMNS}
        rows={rows}
        rowKey={r => r.id}
        onRowClick={onOpen}
        empty={<p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No requests yet. The first one your projects send shows up here.</p>}
      />
    </Section>
  )
}
