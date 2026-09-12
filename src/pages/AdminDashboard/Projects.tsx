// src/pages/AdminDashboard/Projects.tsx
// Every developer project: search, filter by status, and moderate them
// (status changes and fee-share overrides both require a reason).
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { adminService, type AdminProject, type ProjectStatus } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Section, Modal, DataTable, Pager, StatusBadge, SearchInput, DetailRow, fmtUsd, timeAgo, Field, inputCls, type Column } from './shared'
import { useLoad, useAdminRole } from './hooks'
import { Select, FilterBar, RowButton } from './components/Controls'
import { ReasonDialog } from './components/ReasonDialog'
import { fullDate } from './format'

const PAGE_SIZE = 50
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'suspended', label: 'Suspended' },
]

type Pending =
  | { kind: 'status'; project: AdminProject; status: ProjectStatus }
  | { kind: 'fee-share'; project: AdminProject }

export default function AdminProjects() {
  const { isSuperAdmin, can } = useAdminRole()
  const [offset, setOffset] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [feeShareDraft, setFeeShareDraft] = useState('')
  const [details, setDetails] = useState<AdminProject | null>(null)

  const fetcher = useCallback(
    () => adminService.searchProjects({ limit: PAGE_SIZE, offset, q: q || undefined, status: status || undefined }),
    [offset, q, status],
  )
  const { data, setData, loading, error } = useLoad(fetcher, 'Could not load projects')

  const rows = data?.projects || []
  const total = data?.total ?? null

  const resetAndSet = (setter: (v: string) => void) => (v: string) => {
    setOffset(0)
    setter(v)
  }

  const applyResult = (updated: AdminProject) => {
    setData(prev => (prev ? { ...prev, projects: prev.projects.map(p => (p.id === updated.id ? updated : p)) } : prev))
    if (details?.id === updated.id) setDetails(updated)
  }

  const confirm = async (reason: string) => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'status') {
        applyResult(await adminService.setProjectStatus(pending.project.id, pending.status, reason))
        toast.success(`Project ${pending.status}`)
      } else {
        const value = feeShareDraft.trim() === '' ? null : Number(feeShareDraft)
        applyResult(await adminService.setProjectFeeShare(pending.project.id, value, reason))
        toast.success('Fee share updated')
      }
      setPending(null)
    } catch (e: any) {
      toast.error(e?.message || 'The change was not applied')
    } finally {
      setBusy(false)
    }
  }

  const openFeeShare = (p: AdminProject) => {
    setFeeShareDraft(p.fee_share_percent == null ? '' : String(p.fee_share_percent))
    setPending({ kind: 'fee-share', project: p })
  }

  const COLUMNS: Column<AdminProject>[] = [
    {
      key: 'name',
      header: 'Project',
      render: p => (
        <div>
          <div className="text-[color:var(--ink)]">{p.name}</div>
          <div className="text-[0.76rem] text-[color:var(--ink-4)]">{p.owner_email || '-'}</div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: p => <StatusBadge status={p.status} /> },
    { key: 'total_volume_usd', header: 'Volume', align: 'right', render: p => <span className="f-mono">{fmtUsd(p.total_volume_usd, 0)}</span> },
    { key: 'total_earned', header: 'Earned', align: 'right', render: p => <span className="f-mono">{fmtUsd(p.total_earned)}</span> },
    { key: 'pending_balance', header: 'Pending', align: 'right', render: p => <span className="f-mono">{fmtUsd(p.pending_balance)}</span> },
    { key: 'total_transactions', header: 'Tx', align: 'right', render: p => <span className="f-mono">{p.total_transactions ?? 0}</span> },
    { key: 'last_request_at', header: 'Last request', render: p => <span className="whitespace-nowrap text-[color:var(--ink-4)]">{timeAgo(p.last_request_at)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: p => (
        <div className="flex justify-end gap-2">
          <RowButton onClick={() => setDetails(p)}>Details</RowButton>
          {can('super_admin', 'staff_finance') && <RowButton onClick={() => openFeeShare(p)}>Fee share</RowButton>}
          {can('super_admin', 'staff_moderator') && (
            <RowButton onClick={() => setPending({ kind: 'status', project: p, status: p.status === 'suspended' ? 'active' : 'suspended' })}>
              {p.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            </RowButton>
          )}
        </div>
      ),
    },
  ]

  if (loading && !data) return <><PageTitle title="Projects" /><Loading /></>

  return (
    <div>
      <PageTitle title="Projects" subtitle={total != null ? `${total.toLocaleString()} projects across all developers` : undefined} />

      <FilterBar>
        <SearchInput value={q} onChange={resetAndSet(setQ)} placeholder="Search name or owner email" className="w-64" />
        <Select value={status} onChange={resetAndSet(setStatus)} options={STATUS_OPTIONS} label="Status" />
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No projects" hint={error || 'No developer projects match these filters.'} />
      ) : (
        <Section title="Projects">
          <DataTable columns={COLUMNS} rows={rows} rowKey={p => p.id} />
          <Pager offset={offset} limit={PAGE_SIZE} total={total} count={rows.length} onChange={setOffset} />
        </Section>
      )}

      <ReasonDialog
        open={!!pending}
        title={
          pending?.kind === 'status'
            ? `Set ${pending.project.name} to ${pending.status}`
            : `Fee share for ${pending?.kind === 'fee-share' ? pending.project.name : ''}`
        }
        message={pending?.kind === 'status' ? 'The project owner keeps their data; only routing through their API key changes.' : undefined}
        confirmLabel="Save"
        busy={busy}
        disabled={pending?.kind === 'fee-share' && feeShareDraft.trim() !== '' && (Number(feeShareDraft) < 0 || Number(feeShareDraft) > 100 || isNaN(Number(feeShareDraft)))}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      >
        {pending?.kind === 'fee-share' && (
          <Field label="Fee share percent" hint="Overrides the global developer revenue share for this project only. Leave blank to use the global rate.">
            <input
              value={feeShareDraft}
              onChange={e => setFeeShareDraft(e.target.value)}
              placeholder="e.g. 60"
              inputMode="decimal"
              className={inputCls}
            />
          </Field>
        )}
      </ReasonDialog>

      <Modal open={!!details} title={details?.name || 'Project'} onClose={() => setDetails(null)}>
        {details && (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Owner">{details.owner_email || '-'}</DetailRow>
            <DetailRow label="Status"><StatusBadge status={details.status} /></DetailRow>
            <DetailRow label="Description">{details.description || '-'}</DetailRow>
            <DetailRow label="API key">{details.api_key_prefix ? `${details.api_key_prefix}...` : '-'}</DetailRow>
            <DetailRow label="Fee share">{details.fee_share_percent == null ? 'global rate' : `${details.fee_share_percent}%`}</DetailRow>
            <DetailRow label="Payout wallet">{details.payout_wallet || 'not set'}</DetailRow>
            <DetailRow label="Payout chain / token">{details.payout_chain} / {details.payout_token}</DetailRow>
            <DetailRow label="Webhook">{details.webhook_configured ? 'configured' : 'not set'}</DetailRow>
            <DetailRow label="Volume">{fmtUsd(details.total_volume_usd, 0)}</DetailRow>
            <DetailRow label="Earned / pending">{fmtUsd(details.total_earned)} / {fmtUsd(details.pending_balance)}</DetailRow>
            <DetailRow label="Transactions">{details.total_transactions ?? 0}</DetailRow>
            <DetailRow label="Last request">{timeAgo(details.last_request_at)}</DetailRow>
            <DetailRow label="Created">{fullDate(details.created_at)}</DetailRow>
          </div>
        )}
      </Modal>
    </div>
  )
}
