// src/pages/DeveloperDashboard/components/DeliveriesTable.tsx
// What we sent to the endpoint and what it answered, newest first.
import { DataTable, Badge, timeAgo, type Column } from '../shared'

export interface WebhookDelivery {
  id: string
  event: string
  intent_id: string | null
  url: string
  delivered: boolean
  response_status: number | null
  error: string | null
  attempts: number
  created_at: string | null
}

const COLUMNS: Column<WebhookDelivery>[] = [
  { key: 'time', header: 'Time', className: 'f-mono whitespace-nowrap', render: d => timeAgo(d.created_at) },
  { key: 'event', header: 'Event', className: 'f-mono text-[0.78rem]', render: d => <span className="text-[color:var(--ink)]">{d.event}</span> },
  {
    key: 'result',
    header: 'Result',
    render: d =>
      d.delivered ? (
        <Badge tone="strong">{d.response_status != null ? `Delivered ${d.response_status}` : 'Delivered'}</Badge>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">{d.response_status != null ? `Failed ${d.response_status}` : 'Failed'}</Badge>
          {d.error && <span className="text-[0.76rem] text-[color:var(--ink-4)]">{d.error}</span>}
        </span>
      ),
  },
  { key: 'attempts', header: 'Attempts', align: 'right', className: 'f-mono', render: d => String(d.attempts ?? '-') },
  { key: 'intent', header: 'Intent', className: 'f-mono text-[0.72rem] text-[color:var(--ink-4)]', render: d => d.intent_id || '-' },
]

export function DeliveriesTable({ rows }: { rows: WebhookDelivery[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={d => d.id}
      empty={<p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No deliveries yet. Once your endpoint is set, every event and our attempts to deliver it appear here.</p>}
    />
  )
}
