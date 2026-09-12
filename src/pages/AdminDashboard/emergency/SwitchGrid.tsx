// src/pages/AdminDashboard/emergency/SwitchGrid.tsx
// The narrower switches: each stops one kind of traffic or one flow.
import type { EmergencyState } from '../../../services/adminService'
import { Toggle, Badge } from '../shared'

const TITLES: Record<string, string> = {
  direct_traffic_paused: 'Direct traffic',
  api_traffic_paused: 'API traffic',
  bridging_disabled: 'Bridging',
  swaps_disabled: 'Swaps',
  payouts_frozen: 'Payouts',
  signups_paused: 'Sign-ups',
}

const title = (name: string) => TITLES[name] || name.replace(/_/g, ' ')

export function SwitchGrid({ state, canEdit, busy, onChange }: { state: EmergencyState; canEdit: boolean; busy: boolean; onChange: (name: string, on: boolean) => void }) {
  const names = Object.keys(state.switches || {})
  if (names.length === 0) return null
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {names.map(name => {
        const on = !!state.switches[name]
        return (
          <div key={name} className={`dash-card flex flex-col gap-3 ${on ? 'border-white/30' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[0.98rem] text-[color:var(--ink)]">{title(name)}</div>
                <div className="f-mono mt-1 text-[0.66rem] uppercase tracking-[0.1em] text-[color:var(--ink-4)]">{name}</div>
              </div>
              <Toggle on={on} disabled={!canEdit || busy} onClick={() => onChange(name, !on)} />
            </div>
            <p className="text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">{state.descriptions?.[name] || ''}</p>
            <div>
              <Badge tone={on ? 'strong' : 'muted'}>{on ? 'On' : 'Off'}</Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
