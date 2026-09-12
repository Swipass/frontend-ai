// src/pages/AdminDashboard/health/Services.tsx
// One tile per dependency: reachable or not, how fast, and a plain detail.
import type { HealthService } from '../../../services/adminService'
import { StatusDot } from '../shared'

const LABELS: Record<string, string> = {
  database: 'Database',
  redis: 'Redis',
  llm: 'Intent parser',
  smtp: 'Email (SMTP)',
  oauth_google: 'Google sign-in',
  oauth_github: 'GitHub sign-in',
  fee_recipient: 'Fee recipient',
  treasury: 'Treasury',
  encryption_key: 'Encryption key',
}

export function Services({ services }: { services: HealthService[] }) {
  if (services.length === 0) return <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No service checks were reported.</p>
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {services.map(s => (
        <div key={s.name} className={`dash-card flex flex-col gap-2 !p-4 ${s.ok ? '' : 'border-white/30'}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[0.92rem] text-[color:var(--ink)]">
              <StatusDot ok={s.ok} />
              {LABELS[s.name] || s.name}
            </span>
            <span className="f-mono text-[0.72rem] text-[color:var(--ink-4)]">{s.latency_ms == null ? '' : `${s.latency_ms} ms`}</span>
          </div>
          <p className="break-words text-[0.78rem] leading-relaxed text-[color:var(--ink-3)]">{s.detail}</p>
        </div>
      ))}
    </div>
  )
}
