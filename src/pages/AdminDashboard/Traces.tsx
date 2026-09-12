// src/pages/AdminDashboard/Traces.tsx
// Full-trace drill-down: every intent, stage by stage, exactly as recorded.
// Nothing here is reconstructed; a stage that was not written is not shown.
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Modal, DataTable, Pager, StatusBadge, selectCls, inputCls, type Column } from './shared'
import { routeLabel, truthLabel } from './format'
import { TraceView } from './components/TraceView'

const COLUMNS: Column<any>[] = [
  { key: 'created_at', header: 'Time', render: r => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</span> },
  { key: 'command', header: 'Command', render: r => <span className="block max-w-[220px] truncate">{r.command || '-'}</span> },
  { key: 'route', header: 'Route', render: r => <span className="whitespace-nowrap">{routeLabel(r.from_chain, r.to_chain)}</span> },
  { key: 'selected_provider', header: 'Provider', render: r => r.selected_provider || '-' },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'truth_return_bps', header: 'Truth return', render: r => <span className="f-mono">{truthLabel(r.truth_return_bps)}</span> },
]

const PAGE_SIZE = 25

export default function Traces() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('')
  const [wallet, setWallet] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const load = useCallback(() => {
    setLoading(true)
    adminService
      .listTraces({ limit: PAGE_SIZE, offset, status: status || undefined, wallet: wallet || undefined })
      .then(d => {
        setRows(d.traces || [])
        setTotal(d.total || 0)
      })
      .catch(() => {
        setRows([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [offset, status, wallet])

  useEffect(() => {
    load()
  }, [load])

  const openTrace = useCallback(
    async (traceId: string) => {
      setDetailLoading(true)
      setSelected({ trace_id: traceId, stages: [] })
      try {
        setSelected(await adminService.getTrace(traceId))
      } catch {
        setSelected(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [],
  )

  // A link elsewhere in the dashboard (recent intents, transactions) can send
  // us straight to one trace via ?trace=<id>.
  useEffect(() => {
    const id = searchParams.get('trace')
    if (id) {
      openTrace(id)
      const next = new URLSearchParams(searchParams)
      next.delete('trace')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <PageTitle
        title="Traces"
        subtitle="Every intent end to end: parsed intent, execution graph, quotes, route, transaction, outcome."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={wallet}
              onChange={e => setWallet(e.target.value.trim())}
              placeholder="Filter by wallet"
              className={`${inputCls} w-56`}
            />
            <select
              value={status}
              onChange={e => {
                setOffset(0)
                setStatus(e.target.value)
              }}
              className={selectCls}
            >
              <option value="">All statuses</option>
              <option value="quoted">Quoted</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        }
      />

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No traces yet"
          hint="Every intent records a trace as it runs. They appear here as soon as the first one is processed."
        />
      ) : (
        <>
          <DataTable columns={COLUMNS} rows={rows} rowKey={r => r.trace_id} onRowClick={r => openTrace(r.trace_id)} />
          <Pager offset={offset} limit={PAGE_SIZE} total={total} count={rows.length} onChange={setOffset} />
        </>
      )}

      <Modal open={!!selected} title="Intent trace" onClose={() => setSelected(null)} wide>
        <TraceView loading={detailLoading} trace={selected} />
      </Modal>
    </div>
  )
}
