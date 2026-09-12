// src/pages/AdminDashboard/emergency/Limits.tsx
// The per-transaction cap and the maintenance message, with a preview of
// what users see: the app banner and the API's refusal text.
import { useEffect, useState } from 'react'
import type { EmergencyState } from '../../../services/adminService'
import { Section, Field, inputCls, fmtUsd } from '../shared'
import { Note } from '../components/Controls'

const PAUSED_TEXT = 'The Swipass app is paused for maintenance. Please try again shortly.'

function BannerPreview({ message, paused }: { message: string; paused: boolean }) {
  const text = message.trim()
  if (!text && !paused) return <Note>Nothing is shown to users while there is no message and the platform is live.</Note>
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="kicker mb-2">App banner</div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.14] bg-[#0a0a0a] px-4 py-2.5 text-[0.82rem] text-[color:var(--ink)]">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink)]" aria-hidden="true" />
          {text || PAUSED_TEXT}
        </div>
      </div>
      {paused && (
        <div>
          <div className="kicker mb-2">API answer while paused</div>
          <div className="f-mono rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-[0.74rem] text-[color:var(--ink-3)]">
            503 {PAUSED_TEXT}
            {text ? ` ${text}` : ''}
          </div>
        </div>
      )}
    </div>
  )
}

export function Limits({
  state,
  canEdit,
  busy,
  onSaveCap,
  onSaveMessage,
}: {
  state: EmergencyState
  canEdit: boolean
  busy: boolean
  onSaveCap: (cap: number | null) => void
  onSaveMessage: (message: string | null) => void
}) {
  const [cap, setCap] = useState(state.max_intent_usd == null ? '' : String(state.max_intent_usd))
  const [message, setMessage] = useState(state.maintenance_message || '')
  useEffect(() => setCap(state.max_intent_usd == null ? '' : String(state.max_intent_usd)), [state.max_intent_usd])
  useEffect(() => setMessage(state.maintenance_message || ''), [state.maintenance_message])

  const capValue = cap.trim() === '' ? null : Number(cap)
  const capValid = capValue === null || (isFinite(capValue) && capValue > 0)
  const capDirty = capValue !== (state.max_intent_usd ?? null)
  const messageDirty = (message.trim() || null) !== (state.maintenance_message || null)
  const paused = state.system_paused || !!state.switches?.direct_traffic_paused

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <Section title="Trade cap" subtitle="Refuse any intent whose input is worth more than this. Empty means no cap.">
        <Field label="Maximum per transaction (USD)" hint={state.max_intent_usd == null ? 'No cap is set.' : `Current cap ${fmtUsd(state.max_intent_usd, 0)}.`}>
          <input type="number" min={1} step={100} value={cap} onChange={e => setCap(e.target.value)} placeholder="No cap" disabled={!canEdit} className={inputCls} />
        </Field>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" disabled={!canEdit || busy || !capValid || !capDirty} onClick={() => onSaveCap(capValue)} className="pill pill-light h-10 disabled:opacity-40">
            Save cap
          </button>
          {!capValid && <Note>Enter a positive amount, or leave it empty for no cap.</Note>}
        </div>
      </Section>

      <Section title="Maintenance message" subtitle="Shown in the app banner and appended to the API's refusal while paused.">
        <Field label="Message">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} maxLength={500} disabled={!canEdit} placeholder="No message" className={`${inputCls} resize-y`} />
        </Field>
        <div className="mt-4">
          <BannerPreview message={message} paused={paused} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" disabled={!canEdit || busy || !messageDirty} onClick={() => onSaveMessage(message.trim() || null)} className="pill pill-light h-10 disabled:opacity-40">
            Save message
          </button>
          {state.maintenance_message && (
            <button type="button" disabled={!canEdit || busy} onClick={() => onSaveMessage(null)} className="pill pill-dark h-10 disabled:opacity-40">
              Clear
            </button>
          )}
        </div>
      </Section>
    </div>
  )
}
