// src/pages/AdminDashboard/components/TraceView.tsx
// One intent's full stage-by-stage trace, exactly as recorded. Shared by the
// Traces page and the Transactions detail modal, so "view the trace" means
// the same thing everywhere.
import { Loading } from '../shared'
import { truthLabel } from '../format'

function StageRow({ stage }: { stage: any }) {
  return (
    <div className="border-b border-white/[0.06] py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="f-mono text-[0.72rem] uppercase tracking-[0.08em] text-[color:var(--ink-2)]">{stage.stage}</span>
        <span className="f-mono text-[0.72rem] text-[color:var(--ink-4)]">
          {stage.status} · {stage.duration_ms ?? 0}ms
        </span>
      </div>
      {stage.detail && Object.keys(stage.detail).length > 0 && (
        <pre className="f-mono mt-2 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-[0.72rem] leading-relaxed text-[color:var(--ink-3)]">
          {JSON.stringify(stage.detail, null, 2)}
        </pre>
      )}
    </div>
  )
}

export function TraceView({ loading, trace }: { loading: boolean; trace: any }) {
  if (loading) return <Loading />
  if (!trace) return <p className="text-[0.86rem] text-[color:var(--ink-3)]">That trace could not be loaded.</p>

  const rows: [string, unknown][] = [
    ['Intent', trace.trace_id ?? trace.id],
    ['Command', trace.command],
    ['Wallet', trace.wallet_address],
    ['Provider', trace.selected_provider],
    ['Quoted out', trace.quoted_to_amount],
    ['Actual out', trace.actual_to_amount],
    ['Truth return', truthLabel(trace.truth_return_bps)],
    ['Transaction', trace.tx_hash],
    ['Total time', `${trace.total_duration_ms ?? 0}ms`],
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 text-[0.8rem]">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="f-mono text-[0.66rem] uppercase tracking-[0.08em] text-[color:var(--ink-4)]">{label}</div>
            <div className="break-all text-[color:var(--ink-2)]">{(value as string) || '-'}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.07] pt-1">
        {(trace.stages || []).map((s: any, i: number) => (
          <StageRow key={i} stage={s} />
        ))}
        {(trace.stages || []).length === 0 && <p className="py-4 text-[0.82rem] text-[color:var(--ink-4)]">No stages recorded for this intent.</p>}
      </div>
    </div>
  )
}
