// src/pages/DeveloperDashboard/components/TraceStages.tsx
// The recorded stages of one intent, in order. Each stage's detail is exactly
// what the pipeline wrote, folded away until asked for.
import type { TraceStage } from '../../../services/platformService'
import { Badge } from '../shared'

export function TraceStages({ stages }: { stages: TraceStage[] }) {
  if (stages.length === 0) {
    return <p className="py-4 text-[0.84rem] text-[color:var(--ink-4)]">No stages were recorded for this request.</p>
  }
  return (
    <ol className="relative">
      <span className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-white/[0.08]" aria-hidden="true" />
      {stages.map((s, i) => {
        const failed = ['fail', 'failed', 'error'].includes((s.status || '').toLowerCase())
        const hasDetail = s.detail && Object.keys(s.detail).length > 0
        return (
          <li key={`${s.stage}-${i}`} className="relative flex gap-3 py-2.5">
            <span
              className={`f-mono relative grid h-[1.375rem] w-[1.375rem] shrink-0 place-items-center rounded-full border bg-[#111111] text-[0.55rem] ${
                failed ? 'border-white/20 text-[color:var(--ink-4)]' : 'border-[color:var(--ink)] text-[color:var(--ink)]'
              }`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[0.86rem] text-[color:var(--ink)]">{s.stage.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={failed ? 'muted' : 'neutral'}>{s.status || 'unknown'}</Badge>
                  <span className="f-mono text-[0.7rem] text-[color:var(--ink-4)]">{s.duration_ms ?? 0} ms</span>
                </span>
              </div>
              {hasDetail && (
                <details className="mt-1.5">
                  <summary className="cursor-pointer text-[0.74rem] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">Detail</summary>
                  <pre className="f-mono mt-2 max-h-72 overflow-auto rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-[0.7rem] leading-relaxed text-[color:var(--ink-3)]">
                    {JSON.stringify(s.detail, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
