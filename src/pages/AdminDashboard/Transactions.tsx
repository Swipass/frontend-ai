// src/pages/AdminDashboard/Transactions.tsx
// Every intent logged on the platform: filterable, exportable, and with a
// detail view that links straight into its full trace.
import { useCallback, useState } from 'react'
import { adminService, type AdminTransaction } from '../../services/adminService'
import {
  PageTitle, Loading, EmptyState, Section, Modal, DataTable, Pager, StatusBadge,
  SearchInput, DetailRow, ExternalLink, timeAgo, fmtUsd, explorerTx, type Column,
} from './shared'
import { useLoad } from './hooks'
import { Select, FilterBar } from './components/Controls'
import { TraceView } from './components/TraceView'
import { routeLabel, fmtAmount, fmtFee, fullDate, downloadCsv } from './format'

const PAGE_SIZE = 25
const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]

export default function Transactions() {
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('')
  const [provider, setProvider] = useState('')
  const [chain, setChain] = useState('')
  const [projectId, setProjectId] = useState('')
  const [q, setQ] = useState('')
  const [since, setSince] = useState('')
  const [selected, setSelected] = useState<AdminTransaction | null>(null)
  const [trace, setTrace] = useState<any>(null)
  const [traceLoading, setTraceLoading] = useState(false)

  const fetcher = useCallback(
    () =>
      adminService.searchTransactions({
        limit: PAGE_SIZE,
        offset,
        status: status || undefined,
        provider: provider || undefined,
        chain: chain || undefined,
        project_id: projectId || undefined,
        q: q || undefined,
        since: since ? new Date(since).toISOString() : undefined,
      }),
    [offset, status, provider, chain, projectId, q, since],
  )
  const { data, loading, error } = useLoad(fetcher, 'Could not load transactions')

  const rows = data?.transactions || []
  const total = data?.total ?? null

  const resetAndSet = (setter: (v: string) => void) => (v: string) => {
    setOffset(0)
    setter(v)
  }

  const openTrace = async (id: string) => {
    setTraceLoading(true)
    setTrace(null)
    try {
      setTrace(await adminService.getTrace(id))
    } catch {
      setTrace(null)
    } finally {
      setTraceLoading(false)
    }
  }

  const exportCsv = () => {
    downloadCsv(
      `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Time', 'Command', 'From chain', 'To chain', 'From token', 'To token', 'From amount', 'To amount', 'Volume USD', 'Fee USD', 'Provider', 'Status', 'Project', 'Wallet', 'Destination', 'Tx hash'],
      rows.map(r => [
        r.created_at || '', r.command || '', r.from_chain || '', r.to_chain || '', r.from_token || '', r.to_token || '',
        r.from_amount ?? '', r.to_amount ?? '', r.volume_usd ?? 0, r.fee_usd ?? 0, r.selected_provider || '',
        r.status || '', r.project_name || '', r.wallet_address || '', r.destination_address || '', r.tx_hash || '',
      ]),
    )
  }

  const COLUMNS: Column<AdminTransaction>[] = [
    { key: 'created_at', header: 'Time', render: r => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{timeAgo(r.created_at)}</span> },
    { key: 'command', header: 'Command', render: r => <span className="block max-w-[200px] truncate">{r.command || '-'}</span> },
    { key: 'route', header: 'Route', render: r => <span className="whitespace-nowrap">{routeLabel(r.from_chain, r.to_chain)}</span> },
    { key: 'amounts', header: 'Amount', render: r => <span className="f-mono whitespace-nowrap text-[0.78rem]">{fmtAmount(r.from_amount)} {r.from_token} → {fmtAmount(r.to_amount)} {r.to_token}</span> },
    { key: 'volume_usd', header: 'Volume', align: 'right', render: r => <span className="f-mono">{fmtUsd(r.volume_usd)}</span> },
    { key: 'fee_usd', header: 'Fee', align: 'right', render: r => <span className="f-mono">{fmtFee(r.fee_usd)}</span> },
    { key: 'selected_provider', header: 'Provider', render: r => r.selected_provider || '-' },
    { key: 'project_name', header: 'Project', render: r => r.project_name || <span className="text-[color:var(--ink-4)]">direct</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'tx_hash',
      header: 'Tx',
      render: r => {
        const link = explorerTx(r.from_chain, r.tx_hash)
        return link ? (
          <span onClick={e => e.stopPropagation()}>
            <ExternalLink href={link}>view</ExternalLink>
          </span>
        ) : (
          <span className="text-[color:var(--ink-4)]">-</span>
        )
      },
    },
  ]

  const filters = (
    <FilterBar
      right={
        <>
          <button type="button" onClick={exportCsv} disabled={rows.length === 0} className="pill pill-dark h-9 disabled:opacity-40">
            Export CSV
          </button>
        </>
      }
    >
      <SearchInput value={q} onChange={resetAndSet(setQ)} placeholder="Command, wallet, tx hash" className="w-56" />
      <Select value={status} onChange={resetAndSet(setStatus)} options={STATUSES} label="Status" />
      <input
        value={provider}
        onChange={e => resetAndSet(setProvider)(e.target.value)}
        placeholder="Provider"
        className="h-9 w-28 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 text-xs text-[color:var(--ink-2)] outline-none focus:border-white/30"
      />
      <input
        value={chain}
        onChange={e => resetAndSet(setChain)(e.target.value)}
        placeholder="Chain"
        className="h-9 w-24 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 text-xs text-[color:var(--ink-2)] outline-none focus:border-white/30"
      />
      <input
        value={projectId}
        onChange={e => resetAndSet(setProjectId)(e.target.value)}
        placeholder="Project ID"
        className="h-9 w-32 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 text-xs text-[color:var(--ink-2)] outline-none focus:border-white/30"
      />
      <input
        type="date"
        value={since}
        onChange={e => resetAndSet(setSince)(e.target.value)}
        className="h-9 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 text-xs text-[color:var(--ink-2)] outline-none focus:border-white/30 [color-scheme:dark]"
      />
    </FilterBar>
  )

  if (loading && !data) return <><PageTitle title="Transactions" /><Loading /></>

  return (
    <div>
      <PageTitle title="Transactions" subtitle={total != null ? `${total.toLocaleString()} intents logged` : undefined} />

      {filters}

      {rows.length === 0 ? (
        <EmptyState title="No transactions" hint={error || 'Nothing matches these filters yet.'} />
      ) : (
        <Section title="Intent log" subtitle="Click a row for the full detail and its trace.">
          <DataTable columns={COLUMNS} rows={rows} rowKey={r => r.id} onRowClick={setSelected} />
          <Pager offset={offset} limit={PAGE_SIZE} total={total} count={rows.length} onChange={setOffset} />
        </Section>
      )}

      <Modal open={!!selected} title="Transaction" onClose={() => { setSelected(null); setTrace(null) }} wide>
        {selected && (
          <div>
            <div className="mb-5 flex flex-col gap-0.5">
              <DetailRow label="Command">{selected.command || '-'}</DetailRow>
              <DetailRow label="Route">{routeLabel(selected.from_chain, selected.to_chain)}</DetailRow>
              <DetailRow label="Amount">{fmtAmount(selected.from_amount)} {selected.from_token} → {fmtAmount(selected.to_amount)} {selected.to_token}</DetailRow>
              <DetailRow label="Volume">{fmtUsd(selected.volume_usd)}</DetailRow>
              <DetailRow label="Fee">{fmtFee(selected.fee_usd)}</DetailRow>
              <DetailRow label="Provider">{selected.selected_provider || '-'}</DetailRow>
              <DetailRow label="Status"><StatusBadge status={selected.status} /></DetailRow>
              <DetailRow label="Project">{selected.project_name || 'direct (no API key)'}</DetailRow>
              <DetailRow label="Wallet">{selected.wallet_address || '-'}</DetailRow>
              <DetailRow label="Destination">{selected.destination_address || 'same as wallet'}</DetailRow>
              <DetailRow label="Transaction">
                {explorerTx(selected.from_chain, selected.tx_hash) ? (
                  <ExternalLink href={explorerTx(selected.from_chain, selected.tx_hash) as string}>{selected.tx_hash}</ExternalLink>
                ) : (
                  selected.tx_hash || 'not broadcast yet'
                )}
              </DetailRow>
              {selected.error_message && <DetailRow label="Error">{selected.error_message}</DetailRow>}
              <DetailRow label="Time">{fullDate(selected.created_at)}</DetailRow>
            </div>

            {!trace && !traceLoading && (
              <button type="button" onClick={() => openTrace(selected.id)} className="pill pill-dark h-10">
                View full trace
              </button>
            )}
            {(trace || traceLoading) && (
              <div className="mt-5 border-t border-white/[0.07] pt-5">
                <TraceView loading={traceLoading} trace={trace} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
