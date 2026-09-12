// src/pages/DeveloperDashboard/components/TraceModal.tsx
// One request, stage by stage, from the project's recorded trace (a trace id is
// the intent id). The request row's own fields show first, so amounts, fee and
// any error are there even when no trace was recorded. Nothing is
// reconstructed: a missing trace says so.
import { useEffect, useState } from 'react'
import { platformService, type IntentTrace, type ProjectIntent } from '../../../services/platformService'
import { Modal, Loading, DetailRow, StatusBadge, fmtUsd } from '../shared'
import { fmtAmount, fmtFee, fullDate, routeLabel, truthLabel } from '../format'
import { TraceStages } from './TraceStages'
import { TxLink } from './cells'

export type TraceTarget = { projectId: string; intent: Partial<ProjectIntent> & { id: string } }

export function TraceModal({ target, onClose }: { target: TraceTarget | null; onClose: () => void }) {
  const [trace, setTrace] = useState<IntentTrace | null>(null)
  const [loading, setLoading] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!target) return
    let cancelled = false
    setTrace(null)
    setMissing(false)
    setLoading(true)
    platformService
      .getProjectTrace(target.projectId, target.intent.id)
      .then(t => !cancelled && setTrace(t))
      .catch(() => !cancelled && setMissing(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [target])

  const i = target?.intent
  return (
    <Modal open={!!target} title="Request trace" onClose={onClose} wide>
      {i && (
        <div className="mb-6">
          <div className="kicker mb-2">Request</div>
          <DetailRow label="Intent">
            <span className="f-mono">{i.id}</span>
          </DetailRow>
          {i.command && <DetailRow label="Command">{i.command}</DetailRow>}
          <DetailRow label="Route">{routeLabel(i.from_chain, i.to_chain)}</DetailRow>
          {(i.from_amount || i.to_amount) && (
            <DetailRow label="Amounts">
              <span className="f-mono">
                {fmtAmount(i.from_amount)} {i.from_token} → {fmtAmount(i.to_amount)} {i.to_token}
              </span>
            </DetailRow>
          )}
          {i.volume_usd != null && <DetailRow label="Volume">{fmtUsd(i.volume_usd)}</DetailRow>}
          {i.fee_usd != null && <DetailRow label="Fee">{fmtFee(i.fee_usd)}</DetailRow>}
          <DetailRow label="Provider">{i.selected_provider || '-'}</DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={i.status} />
          </DetailRow>
          {i.wallet_address && (
            <DetailRow label="Wallet">
              <span className="f-mono">{i.wallet_address}</span>
            </DetailRow>
          )}
          {i.destination_address && i.destination_address !== i.wallet_address && (
            <DetailRow label="Destination">
              <span className="f-mono">{i.destination_address}</span>
            </DetailRow>
          )}
          <DetailRow label="Transaction">
            <TxLink chain={i.from_chain} hash={i.tx_hash} head={10} tail={8} />
          </DetailRow>
          {i.error_message && <DetailRow label="Error">{i.error_message}</DetailRow>}
          <DetailRow label="Time">{fullDate(i.created_at)}</DetailRow>
        </div>
      )}

      <div className="kicker mb-2">Trace</div>
      {loading ? (
        <Loading label="Loading the trace..." />
      ) : missing || !trace ? (
        <p className="py-4 text-[0.84rem] leading-relaxed text-[color:var(--ink-3)]">
          No trace was recorded for this request. Traces are written as an intent runs, so requests from before tracing was enabled have none.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <DetailRow label="Quoted out">{fmtAmount(trace.quoted_to_amount)}</DetailRow>
            <DetailRow label="Actual out">{fmtAmount(trace.actual_to_amount)}</DetailRow>
            <DetailRow label="Truth return">{truthLabel(trace.truth_return_bps)}</DetailRow>
            <DetailRow label="Total time">
              <span className="f-mono">{trace.total_duration_ms ?? 0} ms</span>
            </DetailRow>
          </div>
          <TraceStages stages={trace.stages || []} />
        </>
      )}
    </Modal>
  )
}
