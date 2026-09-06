// src/pages/AdminDashboard/Traces.tsx
// Full-trace drill-down: every intent, stage by stage, exactly as recorded.
// Nothing here is reconstructed; a stage that was not written is not shown.
import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, Modal, selectCls, inputCls } from './shared'

const PAGE_SIZE = 25

function truthLabel(bps: number | null | undefined): string {
  if (bps === null || bps === undefined) return '-'
  const sign = bps > 0 ? '+' : ''
  return `${sign}${bps} bps`
}

function StageRow({ stage }: { stage: any }) {
  return (
    <div className="border-b border-dark-grey-3 py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-light-grey-2">{stage.stage}</span>
        <span className="text-xs font-mono text-light-grey-1">
          {stage.status} · {stage.duration_ms ?? 0}ms
        </span>
      </div>
      {stage.detail && Object.keys(stage.detail).length > 0 && (
        <pre className="mt-2 text-xs font-mono text-light-grey-1 bg-dark-grey-2 border border-dark-grey-3 rounded p-3 overflow-x-auto">
          {JSON.stringify(stage.detail, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function Traces() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('')
  const [wallet, setWallet] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

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

  const openTrace = async (traceId: string) => {
    setDetailLoading(true)
    setSelected({ trace_id: traceId, stages: [] })
    try {
      setSelected(await adminService.getTrace(traceId))
    } catch {
      setSelected(null)
    } finally {
      setDetailLoading(false)
    }
  }

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
          <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Command</th>
                  <th className="p-3 text-left">Route</th>
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Truth return</th>
                  <th className="p-3 text-right">Trace</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.trace_id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                    <td className="p-3 text-light-grey-1 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="p-3 text-light-grey-3 max-w-[260px] truncate">{r.command || '-'}</td>
                    <td className="p-3 text-light-grey-1 whitespace-nowrap">
                      {r.from_chain} to {r.to_chain}
                    </td>
                    <td className="p-3 text-light-grey-2">{r.selected_provider || '-'}</td>
                    <td className="p-3 text-light-grey-2 uppercase tracking-wider text-xs">{r.status}</td>
                    <td className="p-3 font-mono text-light-grey-1">{truthLabel(r.truth_return_bps)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openTrace(r.trace_id)}
                        className="sw-btn sw-btn-ghost text-xs py-1 px-3"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-light-grey-1">
            <span>
              {offset + 1} to {Math.min(offset + PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="sw-btn sw-btn-ghost text-xs py-1 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                className="sw-btn sw-btn-ghost text-xs py-1 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Modal open={!!selected} title="Intent trace" onClose={() => setSelected(null)} wide>
        {detailLoading ? (
          <Loading />
        ) : selected ? (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              {[
                ['Intent', selected.trace_id],
                ['Command', selected.command],
                ['Wallet', selected.wallet_address],
                ['Provider', selected.selected_provider],
                ['Quoted out', selected.quoted_to_amount],
                ['Actual out', selected.actual_to_amount],
                ['Truth return', truthLabel(selected.truth_return_bps)],
                ['Transaction', selected.tx_hash],
                ['Total time', `${selected.total_duration_ms ?? 0}ms`],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="uppercase tracking-wider text-light-grey-1">{label}</div>
                  <div className="font-mono text-light-grey-3 break-all">{(value as string) || '-'}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-dark-grey-3 pt-2">
              {(selected.stages || []).map((s: any, i: number) => (
                <StageRow key={i} stage={s} />
              ))}
              {(selected.stages || []).length === 0 && (
                <p className="text-xs text-light-grey-1 py-4">No stages recorded for this intent.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-light-grey-1">That trace could not be loaded.</p>
        )}
      </Modal>
    </div>
  )
}
