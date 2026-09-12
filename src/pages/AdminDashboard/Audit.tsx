// src/pages/AdminDashboard/Audit.tsx
// The immutable record of every admin action: who did what, to what, and why
// (the reason lands in `detail` for actions that take one).
import { useCallback, useState } from 'react'
import { adminService, type AuditEntry } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Section, Modal, DataTable, Pager, DetailRow, SearchInput, type Column } from './shared'
import { useLoad } from './hooks'
import { FilterBar, JsonBlock } from './components/Controls'
import { fullDate } from './format'

const PAGE_SIZE = 100

export default function Audit() {
  const [offset, setOffset] = useState(0)
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const fetcher = useCallback(
    () => adminService.searchAudit({ limit: PAGE_SIZE, offset, actor: actor || undefined, action: action || undefined }),
    [offset, actor, action],
  )
  const { data, loading, error } = useLoad(fetcher, 'Could not load the audit log')

  const rows = data?.audit || []
  const total = data?.total ?? null

  const resetAndSet = (setter: (v: string) => void) => (v: string) => {
    setOffset(0)
    setter(v)
  }

  const COLUMNS: Column<AuditEntry>[] = [
    { key: 'created_at', header: 'Time', render: r => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{fullDate(r.created_at)}</span> },
    { key: 'actor', header: 'Actor', render: r => <span className="break-all text-[color:var(--ink-2)]">{r.actor || 'system'}</span> },
    { key: 'action', header: 'Action', render: r => <span className="f-mono text-[0.78rem] text-[color:var(--ink)]">{r.action}</span> },
    { key: 'target', header: 'Target', render: r => <span className="break-all text-[color:var(--ink-3)]">{r.target || '-'}</span> },
  ]

  if (loading && !data) return <><PageTitle title="Audit" /><Loading /></>

  return (
    <div>
      <PageTitle title="Audit" subtitle={total != null ? `${total.toLocaleString()} recorded actions` : undefined} />

      <FilterBar>
        <SearchInput value={actor} onChange={resetAndSet(setActor)} placeholder="Actor (user id or email)" className="w-64" />
        <input
          value={action}
          onChange={e => resetAndSet(setAction)(e.target.value)}
          placeholder="Action prefix, e.g. emergency"
          className="h-9 w-56 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs text-[color:var(--ink-2)] outline-none focus:border-white/30"
        />
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No audit entries" hint={error || 'Admin actions will be recorded here as they happen.'} />
      ) : (
        <Section title="Actions" subtitle="Click a row for the full recorded detail.">
          <DataTable columns={COLUMNS} rows={rows} rowKey={(r, i) => String(r.id ?? i)} onRowClick={setSelected} />
          <Pager offset={offset} limit={PAGE_SIZE} total={total} count={rows.length} onChange={setOffset} />
        </Section>
      )}

      <Modal open={!!selected} title="Audit entry" onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-3">
            <DetailRow label="Time">{fullDate(selected.created_at)}</DetailRow>
            <DetailRow label="Actor">{selected.actor || 'system'}</DetailRow>
            <DetailRow label="Action">{selected.action}</DetailRow>
            <DetailRow label="Target">{selected.target || '-'}</DetailRow>
            <div>
              <div className="kicker mb-2">Detail</div>
              <JsonBlock value={selected.detail ?? {}} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
