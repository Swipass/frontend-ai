// src/pages/DeveloperDashboard/Payouts.tsx
// Request a payout per project and see every payout ever made. The minimum and
// whether payouts are on hold come from the platform state in the overview.
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { platformService, type Payout, type PlatformNotice, type Project } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, ConfirmDialog, AlertItem, Section, KpiTile, StatusBadge, DataTable, shortAddr, fmtUsd, type Column } from './shared'
import { fullDate } from './format'
import { TxLink } from './components/cells'

// A payout row with the chain it settles on, so its tx can link to the right explorer.
type PayoutRow = Payout & { chain?: string }

const COLUMNS: Column<PayoutRow>[] = [
  { key: 'date', header: 'Requested', className: 'f-mono whitespace-nowrap', render: r => fullDate(r.created_at) },
  { key: 'project', header: 'Project', render: r => <span className="text-[color:var(--ink)]">{r.project_name || '-'}</span> },
  { key: 'amount', header: 'Amount', align: 'right', className: 'f-mono', render: r => fmtUsd(r.amount) },
  { key: 'wallet', header: 'Wallet', className: 'f-mono', render: r => <span title={r.wallet_address}>{shortAddr(r.wallet_address)}</span> },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'tx', header: 'Transaction', render: r => <TxLink chain={r.chain} hash={r.tx_hash} /> },
  { key: 'notes', header: 'Notes', className: 'text-[0.78rem] text-[color:var(--ink-3)]', render: r => r.notes || '-' },
]

export default function Payouts() {
  const [projects, setProjects] = useState<Project[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [platform, setPlatform] = useState<PlatformNotice | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Project | null>(null)

  const load = useCallback(async () => {
    const [ps, list, overview] = await Promise.all([
      platformService.listProjects().catch((e: Error) => {
        toast.error(e?.message || 'Could not load your projects')
        return [] as Project[]
      }),
      platformService.listPayouts().catch((e: Error) => {
        toast.error(e?.message || 'Could not load payout history')
        return [] as Payout[]
      }),
      platformService.getOverview(7).catch(() => null),
    ])
    setProjects(ps)
    setPayouts(list)
    setPlatform(overview?.platform || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const request = async (p: Project) => {
    setBusy(true)
    try {
      await platformService.requestPayout(p.id)
      setConfirm(null)
      await load()
      toast.success('Payout requested')
    } catch (e: any) {
      toast.error(e?.message || 'Could not request the payout')
    } finally {
      setBusy(false)
    }
  }

  const frozen = !!platform?.payouts_frozen
  const minimum = platform?.minimum_payout_usd ?? null
  const totalPending = projects.reduce((s, p) => s + (p.pending_balance || 0), 0)
  const paidOut = payouts.filter(r => r.status === 'completed').reduce((s, r) => s + (r.amount || 0), 0)
  const inFlight = payouts.filter(r => r.status === 'pending' || r.status === 'processing')
  // Rows carry the project's payout chain so the tx can link to its explorer.
  const rows = payouts.map(r => ({ ...r, chain: projects.find(p => p.id === r.project_id)?.payout_chain }))

  if (loading) return <><PageTitle title="Payouts" /><Loading /></>

  return (
    <div>
      <PageTitle title="Payouts" subtitle={minimum != null ? `Withdraw earnings once a project reaches ${fmtUsd(minimum, 0)}.` : 'Withdraw earnings per project to the wallet set in Fee-share.'} />

      {frozen && (
        <div className="mb-6">
          <AlertItem level="warning" title="Payouts are on hold" detail="Swipass has paused payouts for now. Your balance is safe and keeps accruing; you can request it as soon as they resume." />
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 sm:gap-4">
        <KpiTile label="Pending balance" value={fmtUsd(totalPending)} hint="Across all projects" />
        <KpiTile label="In flight" value={fmtUsd(inFlight.reduce((s, r) => s + (r.amount || 0), 0))} hint={`${inFlight.length} payout${inFlight.length === 1 ? '' : 's'} being processed`} />
        <KpiTile label="Paid out" value={fmtUsd(paidOut)} hint="Completed payouts" />
      </div>

      <Section title="Request a payout" subtitle="Settled per project to the wallet set in Fee-share." className="mb-6">
        {projects.length === 0 ? (
          <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No projects yet. Create one to start earning.</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {projects.map(p => {
              const pending = p.pending_balance || 0
              const hasWallet = !!p.payout_wallet
              const belowMin = minimum != null && pending < minimum
              const eligible = hasWallet && pending > 0 && !belowMin && !frozen
              return (
                <div key={p.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[0.95rem] text-[color:var(--ink)]">{p.name}</div>
                    <div className="f-mono mt-0.5 text-[0.76rem] text-[color:var(--ink-4)]">
                      Pending {fmtUsd(pending)}
                      {hasWallet && <span className="ml-3">to {shortAddr(p.payout_wallet)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {!hasWallet && (
                      <Link to="/dashboard/developer/fee-share" className="text-[0.78rem] text-[color:var(--ink-3)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
                        Set payout wallet
                      </Link>
                    )}
                    {hasWallet && belowMin && <span className="text-[0.78rem] text-[color:var(--ink-4)]">Needs {fmtUsd((minimum as number) - pending)} more</span>}
                    <button type="button" onClick={() => setConfirm(p)} disabled={!eligible || busy} className="pill pill-light h-9 disabled:cursor-not-allowed disabled:opacity-40">
                      Withdraw {fmtUsd(pending)}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="History" subtitle="Every payout requested, newest first.">
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey={r => r.id}
          empty={<p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No payouts yet. Your first request lists here with its status and transaction.</p>}
        />
      </Section>

      <ConfirmDialog
        open={!!confirm}
        title="Request payout"
        message={
          <>
            Withdraw <b className="text-[color:var(--ink)]">{fmtUsd(confirm?.pending_balance)}</b> from <b className="text-[color:var(--ink)]">{confirm?.name}</b> to{' '}
            <span className="f-mono text-[color:var(--ink)]">{shortAddr(confirm?.payout_wallet)}</span> in {confirm?.payout_token || 'USDC'} on {confirm?.payout_chain || 'base'}?
          </>
        }
        confirmLabel="Request payout"
        busy={busy}
        onConfirm={() => confirm && request(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
