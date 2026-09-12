// src/pages/DeveloperDashboard/components/ProjectCard.tsx
// One project: its key prefix, state, the numbers that matter, and the
// actions the developer can take on it.
import { Link } from 'react-router-dom'
import type { Project } from '../../../services/platformService'
import { StatusBadge, timeAgo, fmtUsd, fmtNum } from '../shared'

export function ProjectCard({
  project: p,
  busy,
  onPause,
  onResume,
  onRotate,
  onDelete,
}: {
  project: Project
  busy: boolean
  onPause: () => void
  onResume: () => void
  onRotate: () => void
  onDelete: () => void
}) {
  const suspended = p.status === 'suspended'
  const paused = p.status === 'paused'
  const stats: [string, string][] = [
    ['Pending', fmtUsd(p.pending_balance)],
    ['Earned', fmtUsd(p.total_earned)],
    ['Volume', fmtUsd(p.total_volume_usd, 0)],
    ['Transactions', p.total_transactions != null ? fmtNum(p.total_transactions) : '-'],
  ]

  return (
    <div className="dash-card">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[1.15rem] text-[color:var(--ink)]">{p.name}</h2>
            <StatusBadge status={p.status || 'active'} />
          </div>
          <code className="f-mono mt-1 block text-[0.74rem] text-[color:var(--ink-4)]">{p.api_key_prefix}</code>
          {p.description && <p className="mt-2 text-[0.82rem] leading-relaxed text-[color:var(--ink-3)]">{p.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {suspended ? (
            <span className="text-[0.76rem] text-[color:var(--ink-4)]">Suspended by Swipass. Contact support to restore it.</span>
          ) : paused ? (
            <button type="button" disabled={busy} onClick={onResume} className="pill pill-light h-9 disabled:opacity-50">
              Resume
            </button>
          ) : (
            <button type="button" disabled={busy} onClick={onPause} className="pill pill-dark h-9 disabled:opacity-50">
              Pause
            </button>
          )}
          <button type="button" disabled={busy} onClick={onRotate} className="pill pill-dark h-9 disabled:opacity-50">
            Rotate key
          </button>
          <button type="button" disabled={busy} onClick={onDelete} className="rounded-full px-3 py-1.5 text-[0.78rem] text-[color:var(--ink-3)] hover:text-[color:var(--ink)] disabled:opacity-50">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <div className="kicker mb-1.5">{label}</div>
            <div className="f-mono text-[1.05rem] text-[color:var(--ink)]">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-white/[0.06] pt-4 text-[0.76rem] text-[color:var(--ink-4)]">
        <span>
          Last request <span className="f-mono text-[color:var(--ink-3)]">{timeAgo(p.last_request_at)}</span>
        </span>
        <span>
          Webhook{' '}
          {p.webhook_configured ? (
            <span className="text-[color:var(--ink-3)]">configured</span>
          ) : (
            <Link to={`/dashboard/developer/webhooks?project=${p.id}`} className="text-[color:var(--ink-3)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
              not set
            </Link>
          )}
        </span>
        <span>
          Payout{' '}
          {p.payout_wallet ? (
            <span className="f-mono text-[color:var(--ink-3)]">
              {p.payout_token || 'USDC'} on {p.payout_chain || 'base'}
            </span>
          ) : (
            <Link to="/dashboard/developer/fee-share" className="text-[color:var(--ink-3)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
              wallet not set
            </Link>
          )}
        </span>
        <span>
          Created <span className="f-mono text-[color:var(--ink-3)]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</span>
        </span>
      </div>
    </div>
  )
}
