// src/pages/AdminDashboard/health/RpcTable.tsx
// Every chain's RPC: configured, answering, the block it reported and how fast.
import type { HealthRpc } from '../../../services/adminService'
import { DataTable, Badge, StatusDot, fmtNum, type Column } from '../shared'

const COLUMNS: Column<HealthRpc>[] = [
  { key: 'name', header: 'Chain', render: r => <span className="text-[color:var(--ink)]">{r.name}<span className="f-mono ml-2 text-[0.7rem] text-[color:var(--ink-4)]">{r.chain}</span></span> },
  {
    key: 'configured',
    header: 'RPC',
    render: r => (r.configured ? <Badge tone="neutral">configured</Badge> : <Badge tone="muted">not set</Badge>),
  },
  {
    key: 'ok',
    header: 'Status',
    render: r => (
      <span className="flex items-center gap-2">
        <StatusDot ok={r.ok} />
        {r.configured ? (r.ok ? 'answering' : 'failing') : 'skipped'}
      </span>
    ),
  },
  { key: 'block', header: 'Block', align: 'right', render: r => <span className="f-mono">{r.block == null ? '-' : fmtNum(r.block)}</span> },
  { key: 'latency_ms', header: 'Latency', align: 'right', render: r => <span className="f-mono">{r.latency_ms == null ? '-' : `${r.latency_ms} ms`}</span> },
  { key: 'error', header: 'Error', render: r => <span className="block max-w-[280px] truncate text-[color:var(--ink-4)]" title={r.error || ''}>{r.error || ''}</span> },
]

export function RpcTable({ rows }: { rows: HealthRpc[] }) {
  return <DataTable columns={COLUMNS} rows={rows} rowKey={r => r.chain} empty={<p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No chains are registered.</p>} />
}
