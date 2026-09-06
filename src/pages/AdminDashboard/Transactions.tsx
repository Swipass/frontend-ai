// src/pages/AdminDashboard/Transactions.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import { PageTitle, Loading, StatusDot, selectCls, fmtUsd } from './shared'

const PAGE = 25
const STATUSES = ['', 'completed', 'pending', 'failed']

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    adminService
      .listTransactions(PAGE, offset, status || undefined)
      .then(d => {
        setTxs(d.transactions || d.items || [])
        setTotal(typeof d.total === 'number' ? d.total : null)
      })
      .catch(() => setTxs([]))
      .finally(() => setLoading(false))
  }, [offset, status])

  const canPrev = offset > 0
  const canNext = total != null ? offset + PAGE < total : txs.length === PAGE

  return (
    <div>
      <PageTitle
        title="Transactions"
        subtitle={total != null ? `${total.toLocaleString()} total` : undefined}
        right={
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setOffset(0) }}
            className={selectCls + ' py-1.5'}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s || 'all statuses'}</option>)}
          </select>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Command</th>
                  <th className="p-3 text-left">Route</th>
                  <th className="p-3 text-left">Volume</th>
                  <th className="p-3 text-left">Fee</th>
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-light-grey-1">No transactions</td></tr>
                ) : txs.map((tx, i) => (
                  <tr key={tx.id || i} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                    <td className="p-3 text-light-grey-3 max-w-[220px] truncate">{tx.command || '-'}</td>
                    <td className="p-3 text-light-grey-1">{(tx.from_chain || '?')}{' → '}{(tx.to_chain || '?')}</td>
                    <td className="p-3 text-light-grey-2">{fmtUsd(tx.volume_usd)}</td>
                    <td className="p-3 text-light-grey-2">{fmtUsd(tx.fee_usd, 4)}</td>
                    <td className="p-3 text-light-grey-2">{tx.selected_provider || '-'}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-light-grey-1">
                        <StatusDot ok={tx.status === 'completed'} live={tx.status === 'pending'} />
                        {tx.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-light-grey-1">
              Showing {txs.length ? offset + 1 : 0}
              {' to '}{offset + txs.length}{total != null ? ` of ${total}` : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE))}
                disabled={!canPrev}
                className="text-xs border border-mid-grey rounded px-3 py-1.5 text-light-grey-1 hover:bg-dark-grey-3 transition disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + PAGE)}
                disabled={!canNext}
                className="text-xs border border-mid-grey rounded px-3 py-1.5 text-light-grey-1 hover:bg-dark-grey-3 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
