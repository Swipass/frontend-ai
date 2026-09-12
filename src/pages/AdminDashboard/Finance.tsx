// src/pages/AdminDashboard/Finance.tsx
// Platform fees, what is owed to developers, the treasury and fee recipient
// wallets, and the payout queue: process pending payouts or reject one.
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { adminService, type AdminPayout } from '../../services/adminService'
import {
  PageTitle, Loading, EmptyState, Section, KpiTile, DataTable, StatusBadge, Badge,
  CopyButton, fmtUsd, shortAddr, type Column,
} from './shared'
import { useLoad, useAdminRole } from './hooks'
import { Select, FilterBar, RowButton } from './components/Controls'
import { ReasonDialog } from './components/ReasonDialog'
import { fullDate } from './format'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Finance() {
  const { can } = useAdminRole()
  const [status, setStatus] = useState('')
  const [processing, setProcessing] = useState(false)
  const [rejecting, setRejecting] = useState<AdminPayout | null>(null)
  const [busy, setBusy] = useState(false)

  const fetcher = useCallback(
    () => Promise.all([adminService.getFinance(), adminService.listPayouts(100, status || undefined)]),
    [status],
  )
  const { data, setData, loading, error, reload } = useLoad(fetcher, 'Could not load finance data')

  if (loading && !data) return <><PageTitle title="Finance" /><Loading /></>
  if (!data) {
    return (
      <>
        <PageTitle title="Finance" />
        <EmptyState title="Finance is not available" hint={error || 'The finance endpoint did not answer.'} />
      </>
    )
  }

  const [finance, payouts] = data

  const processPayouts = async () => {
    setProcessing(true)
    try {
      const summary = await adminService.processPayouts()
      toast.success(`${summary.completed} completed, ${summary.failed} failed, ${summary.skipped_no_treasury} skipped`)
      reload(true)
    } catch (e: any) {
      toast.error(e?.message || 'Could not process payouts')
    } finally {
      setProcessing(false)
    }
  }

  const confirmReject = async (reason: string) => {
    if (!rejecting) return
    setBusy(true)
    try {
      const updated = await adminService.rejectPayout(rejecting.id, reason)
      setData(prev => (prev ? [prev[0], prev[1].map(p => (p.id === updated.id ? updated : p))] : prev))
      toast.success('Payout rejected, balance returned to the project')
      setRejecting(null)
    } catch (e: any) {
      toast.error(e?.message || 'Could not reject the payout')
    } finally {
      setBusy(false)
    }
  }

  const canProcess = can('super_admin', 'staff_finance')
  const processDisabledReason = finance.payouts_frozen
    ? 'Payouts are frozen. Turn the switch off on the Emergency page.'
    : !finance.treasury.configured
      ? 'No treasury key is configured.'
      : !canProcess
        ? 'Your role cannot process payouts.'
        : null

  const COLUMNS: Column<AdminPayout>[] = [
    {
      key: 'project_name',
      header: 'Project',
      render: p => (
        <div>
          <div className="text-[color:var(--ink)]">{p.project_name || '-'}</div>
          <div className="text-[0.76rem] text-[color:var(--ink-4)]">{p.owner_email || '-'}</div>
        </div>
      ),
    },
    { key: 'amount', header: 'Amount', align: 'right', render: p => <span className="f-mono">{fmtUsd(p.amount)}</span> },
    { key: 'wallet_address', header: 'Wallet', render: p => <span className="f-mono">{shortAddr(p.wallet_address)}</span> },
    { key: 'status', header: 'Status', render: p => <StatusBadge status={p.status} /> },
    { key: 'tx_hash', header: 'Tx', render: p => (p.tx_hash ? <span className="f-mono">{shortAddr(p.tx_hash)}</span> : '-') },
    { key: 'notes', header: 'Notes', render: p => <span className="block max-w-[200px] truncate text-[color:var(--ink-4)]">{p.notes || '-'}</span> },
    { key: 'created_at', header: 'Requested', render: p => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{fullDate(p.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: p =>
        p.status === 'pending' && can('super_admin', 'staff_finance') ? (
          <RowButton onClick={() => setRejecting(p)}>Reject</RowButton>
        ) : null,
    },
  ]

  return (
    <div>
      <PageTitle
        title="Finance"
        subtitle="Platform fees, what developers are owed, and the payout queue."
        right={
          <button type="button" onClick={processPayouts} disabled={processing || !!processDisabledReason} title={processDisabledReason || undefined} className="pill pill-light h-10 disabled:opacity-40">
            {processing ? 'Processing...' : 'Process pending payouts'}
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile label="Fees accounted (all time)" value={fmtUsd(finance.fees_accounted_usd)} />
        <KpiTile label={`Fees (${finance.window_days}d)`} value={fmtUsd(finance.fees_window_usd)} />
        <KpiTile label="Developer share owed" value={fmtUsd(finance.developer_share_owed_usd)} />
        <KpiTile label="Paid out" value={fmtUsd(finance.paid_out_usd)} />
        <KpiTile label="Pending payouts" value={fmtUsd(finance.pending_payouts.amount_usd)} hint={`${finance.pending_payouts.count} waiting`} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Section title="Treasury" subtitle="Funds developer payouts on-chain.">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge tone={finance.treasury.configured ? 'strong' : 'muted'}>{finance.treasury.configured ? 'configured' : 'not configured'}</Badge>
              <div className="f-mono mt-2 break-all text-[0.82rem] text-[color:var(--ink-2)]">{finance.treasury.address || 'No TREASURY_PRIVATE_KEY set.'}</div>
            </div>
            {finance.treasury.address && <CopyButton text={finance.treasury.address} />}
          </div>
          {!finance.treasury.configured && (
            <p className="mt-3 text-[0.8rem] leading-relaxed text-[color:var(--ink-4)]">
              Without a treasury key, payouts stay pending: balances are safe, they just cannot be sent.
            </p>
          )}
        </Section>
        <Section title="Fee recipient" subtitle="Receives the platform's integrator fee on every route that supports it.">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge tone={finance.fee_recipient.valid ? 'strong' : 'muted'}>{finance.fee_recipient.valid ? 'valid address' : 'missing or invalid'}</Badge>
              <div className="f-mono mt-2 break-all text-[0.82rem] text-[color:var(--ink-2)]">{finance.fee_recipient.address || 'No FEE_RECIPIENT_ADDRESS set.'}</div>
            </div>
            {finance.fee_recipient.address && <CopyButton text={finance.fee_recipient.address} />}
          </div>
          {!finance.fee_recipient.valid && (
            <p className="mt-3 text-[0.8rem] leading-relaxed text-[color:var(--ink-4)]">
              No platform fee is collected on any route until a valid address is set in Control Plane &gt; Credentials.
            </p>
          )}
        </Section>
      </div>

      <FilterBar>
        <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Status" />
      </FilterBar>

      {payouts.length === 0 ? (
        <EmptyState title="No payouts" hint="No developer has requested a payout yet, or none match this filter." />
      ) : (
        <Section title="Payouts" subtitle={`Minimum payout is ${fmtUsd(finance.minimum_payout_usd)}.`}>
          <DataTable columns={COLUMNS} rows={payouts} rowKey={p => p.id} />
        </Section>
      )}

      <ReasonDialog
        open={!!rejecting}
        title={`Reject payout to ${rejecting?.project_name || 'this project'}`}
        message="The requested amount is returned to the project's pending balance."
        confirmLabel="Reject"
        busy={busy}
        onConfirm={confirmReject}
        onCancel={() => setRejecting(null)}
      />
    </div>
  )
}
