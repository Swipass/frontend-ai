// src/pages/DeveloperDashboard/Payouts.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, ConfirmDialog, fmtUsd } from './shared'

const MIN_PAYOUT = 50

// Collect any payout records the API exposes on projects or analytics.
function collectPayouts(projects: any[], analytics: any): any[] {
  const out: any[] = []
  for (const p of projects) {
    const rows = p.payouts || p.payout_history || []
    if (Array.isArray(rows)) rows.forEach(r => out.push({ ...r, project: p.name }))
  }
  const anRows = analytics?.payouts || analytics?.payout_history || []
  if (Array.isArray(anRows)) anRows.forEach((r: any) => out.push(r))
  return out.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime())
}

export default function Payouts() {
  const [projects, setProjects] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmPayout, setConfirmPayout] = useState<any | null>(null)

  const load = () =>
    Promise.all([
      platformService.listProjects().catch(() => []),
      platformService.getAnalytics().catch(() => null),
    ]).then(([ps, an]) => {
      setProjects(ps || [])
      setHistory(collectPayouts(ps || [], an))
      setLoading(false)
    })
  useEffect(() => { load() }, [])

  const request = async (p: any) => {
    setBusy(true)
    try {
      await platformService.requestPayout(p.id)
      setConfirmPayout(null)
      await load()
      toast.success('Payout requested')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to request payout')
    } finally {
      setBusy(false)
    }
  }

  const totalPending = projects.reduce((s, p) => s + (p.pending_balance || 0), 0)

  if (loading) return <><PageTitle title="Payouts" /><Loading /></>

  return (
    <div>
      <PageTitle title="Payouts" subtitle={`Withdraw earnings once a project reaches ${fmtUsd(MIN_PAYOUT, 0)}.`} />

      <div className="dash-card mb-6">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">Total Pending</div>
        <div className="font-display text-3xl font-bold text-almost-white tracking-tighter">{fmtUsd(totalPending)}</div>
        <p className="text-xs text-light-grey-1 mt-2">
          Payouts are settled per project to the wallet set in Fee-share. Minimum {fmtUsd(MIN_PAYOUT, 0)} per project.
        </p>
      </div>

      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-3">Request a Payout</div>
        {projects.length === 0 ? (
          <EmptyState title="No projects" hint="Create a project to start earning." />
        ) : (
          <div className="space-y-3">
            {projects.map(p => {
              const pending = p.pending_balance || 0
              const hasWallet = !!p.payout_wallet
              const eligible = pending >= MIN_PAYOUT && hasWallet
              return (
                <div key={p.id} className="dash-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-display text-base font-semibold text-almost-white">{p.name}</div>
                    <div className="text-xs text-light-grey-1 mt-0.5">Pending {fmtUsd(pending)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!hasWallet && (
                      <Link to="/dashboard/developer/fee-share" className="text-xs text-light-grey-1 hover:text-light-grey-3 underline">
                        Set payout wallet
                      </Link>
                    )}
                    {hasWallet && !eligible && (
                      <span className="text-xs text-light-grey-1">Needs {fmtUsd(MIN_PAYOUT - pending)} more</span>
                    )}
                    <button
                      onClick={() => setConfirmPayout(p)}
                      disabled={!eligible}
                      className="sw-btn sw-btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Withdraw {fmtUsd(pending)}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-3">History</div>
        {history.length === 0 ? (
          <EmptyState title="No payouts yet" hint="Your withdrawal history will appear here once you request a payout." />
        ) : (
          <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Wallet</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                    <td className="p-3 text-light-grey-1">{r.created_at || r.date ? new Date(r.created_at || r.date).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-light-grey-3">{r.project || '-'}</td>
                    <td className="p-3 text-light-grey-2">{fmtUsd(r.amount_usd ?? r.amount)}</td>
                    <td className="p-3"><code className="text-xs text-light-grey-1">{r.wallet || r.payout_wallet ? `${String(r.wallet || r.payout_wallet).slice(0, 10)}...` : '-'}</code></td>
                    <td className="p-3 text-light-grey-1 uppercase tracking-wider text-xs">{r.status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmPayout}
        title="Request payout"
        message={
          <>Withdraw <b className="text-light-grey-3">{fmtUsd(confirmPayout?.pending_balance)}</b> from <b className="text-light-grey-3">{confirmPayout?.name}</b> to your configured payout wallet?</>
        }
        confirmLabel="Request Payout"
        busy={busy}
        onConfirm={() => request(confirmPayout)}
        onCancel={() => setConfirmPayout(null)}
      />
    </div>
  )
}
