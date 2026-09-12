// src/pages/AdminDashboard/emergency/KillSwitch.tsx
// The global pause: every intent request is refused while it is on.
import { StatusDot } from '../shared'
import { Note } from '../components/Controls'

export function KillSwitch({ paused, canEdit, busy, onChange }: { paused: boolean; canEdit: boolean; busy: boolean; onChange: (paused: boolean) => void }) {
  return (
    <div className={`dash-card mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between ${paused ? 'border-white/40' : ''}`}>
      <div>
        <div className="kicker mb-3">Global kill switch</div>
        <div className="flex items-center gap-3 text-[1.6rem] font-light leading-none tracking-[-0.04em] text-[color:var(--ink)]">
          <StatusDot ok={!paused} live={!paused} />
          {paused ? 'Platform paused' : 'Platform live'}
        </div>
        <p className="mt-3 max-w-xl text-[0.86rem] leading-relaxed text-[color:var(--ink-3)]">
          {paused
            ? 'Every /v1/intent request is answered with 503 until the platform is resumed. The dashboards keep working.'
            : 'Pausing refuses every /v1/intent request, from the app and from developer API keys alike, until you resume.'}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <button type="button" disabled={!canEdit || busy} onClick={() => onChange(!paused)} className={`pill h-11 disabled:opacity-40 ${paused ? 'pill-light' : 'pill-outline'}`}>
          {paused ? 'Resume platform' : 'Pause platform'}
        </button>
        {!canEdit && <Note>Only a super admin can change this.</Note>}
      </div>
    </div>
  )
}
