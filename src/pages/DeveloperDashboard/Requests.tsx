// src/pages/DeveloperDashboard/Requests.tsx
// Every request one project has sent, newest first, with filters and paging.
// A row opens the full stage-by-stage trace.
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { platformService, type ProjectIntent } from '../../services/platformService'
import {
  PageTitle, Loading, EmptyState, SearchInput, DataTable, Pager, StatusBadge, timeAgo, fmtUsd, selectCls, type Column,
} from './shared'
import { fmtAmount, fmtFee } from './format'
import { useProjects, useProjectParam } from './useProjects'
import { ProjectSelect } from './components/ProjectSelect'
import { RouteCell, TxLink } from './components/cells'
import { TraceModal, type TraceTarget } from './components/TraceModal'

const LIMIT = 25
const STATUSES = ['completed', 'failed', 'pending']

const COLUMNS: Column<ProjectIntent>[] = [
  { key: 'route', header: 'Route', render: r => <RouteCell fromChain={r.from_chain} toChain={r.to_chain} fromToken={r.from_token} toToken={r.to_token} /> },
  {
    key: 'amounts',
    header: 'Amounts',
    className: 'f-mono whitespace-nowrap',
    render: r => (r.from_amount || r.to_amount ? `${fmtAmount(r.from_amount)} → ${fmtAmount(r.to_amount)}` : '-'),
  },
  { key: 'volume', header: 'Volume', align: 'right', className: 'f-mono', render: r => (r.volume_usd != null ? fmtUsd(r.volume_usd) : '-') },
  { key: 'fee', header: 'Fee', align: 'right', className: 'f-mono', render: r => fmtFee(r.fee_usd) },
  { key: 'provider', header: 'Provider', render: r => r.selected_provider || '-' },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'tx', header: 'Transaction', render: r => <TxLink chain={r.from_chain} hash={r.tx_hash} /> },
  { key: 'time', header: 'Time', className: 'f-mono whitespace-nowrap', render: r => timeAgo(r.created_at) },
]

export default function Requests() {
  const { projects, loading: loadingProjects } = useProjects()
  const [projectId, setProjectId] = useProjectParam(projects)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const [rows, setRows] = useState<ProjectIntent[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [trace, setTrace] = useState<TraceTarget | null>(null)

  // Type freely; the query goes out once typing pauses.
  useEffect(() => {
    const t = window.setTimeout(() => setQ(search.trim()), 350)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => setOffset(0), [projectId, status, q])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setLoading(true)
    platformService
      .listProjectIntents(projectId, { limit: LIMIT, offset, status: status || undefined, q: q || undefined })
      .then(page => {
        if (cancelled) return
        setRows(page.intents || [])
        setTotal(typeof page.total === 'number' ? page.total : null)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setRows([])
        setTotal(null)
        toast.error(e?.message || 'Could not load requests')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [projectId, status, q, offset])

  const header = (
    <PageTitle
      title="Requests"
      subtitle="Everything a project has asked for, and what came of it."
      right={projects.length > 0 ? <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} /> : undefined}
    />
  )

  if (loadingProjects) return <>{header}<Loading /></>
  if (projects.length === 0) {
    return (
      <>
        {header}
        <EmptyState title="No projects yet" hint="Create a project and send a request with its key; every request then lists here." />
      </>
    )
  }

  const filtered = !!(status || q)

  return (
    <div>
      {header}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search command, wallet or tx hash" className="w-full sm:w-80" />
        <label className="inline-flex items-center">
          <span className="sr-only">Status</span>
          <select value={status} onChange={e => setStatus(e.target.value)} className={`${selectCls} h-9 px-3.5 text-[0.8rem]`}>
            <option value="">Any status</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {typeof total === 'number' && <span className="f-mono ml-auto text-[0.74rem] text-[color:var(--ink-4)]">{total.toLocaleString()} total</span>}
      </div>

      {loading && rows.length === 0 ? (
        <Loading />
      ) : (
        <>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={r => r.id}
            onRowClick={r => setTrace({ projectId, intent: r })}
            empty={
              <EmptyState
                title={filtered ? 'Nothing matches these filters' : 'No requests yet'}
                hint={filtered ? 'Clear the search or the status filter to see every request.' : 'Requests appear here as soon as this project sends one.'}
              />
            }
          />
          {(rows.length > 0 || offset > 0) && <Pager offset={offset} limit={LIMIT} total={total} count={rows.length} onChange={setOffset} />}
        </>
      )}

      <TraceModal target={trace} onClose={() => setTrace(null)} />
    </div>
  )
}
