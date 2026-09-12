// src/pages/AdminDashboard/health/ProvidersAndTokens.tsx
// Which providers can quote right now, and which token lists are loaded.
import type { AdminHealth } from '../../../services/adminService'
import { Badge, StatusDot, fmtNum } from '../shared'

export function ProviderAvailability({ providers }: { providers: AdminHealth['providers'] }) {
  if (providers.length === 0) return <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No providers are registered.</p>
  return (
    <ul className="flex flex-col">
      {providers.map(p => (
        <li key={p.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/[0.06] py-2.5 last:border-b-0">
          <span className="flex items-center gap-2 text-[0.88rem] text-[color:var(--ink)]">
            <StatusDot ok={p.available} />
            {p.display_name}
            <span className="f-mono text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--ink-4)]">{p.kind}</span>
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge tone={p.available ? 'neutral' : 'muted'}>{p.available ? 'available' : 'missing key or rpc'}</Badge>
            <Badge tone={p.active ? 'strong' : 'muted'}>{p.active ? 'active' : 'off'}</Badge>
            <span className="f-mono text-[0.7rem] text-[color:var(--ink-4)]">{p.chains.length} chains</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function TokenLists({ lists }: { lists: AdminHealth['token_lists'] }) {
  if (lists.length === 0) return <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No token lists were reported.</p>
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {lists.map(t => (
        <li key={t.chain} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-[0.82rem]">
          <span className="flex items-center gap-2 text-[color:var(--ink-2)]">
            <StatusDot ok={t.loaded} />
            {t.chain}
          </span>
          <span className="f-mono text-[0.72rem] text-[color:var(--ink-4)]">{t.loaded ? `${fmtNum(t.count)} tokens` : 'not loaded'}</span>
        </li>
      ))}
    </ul>
  )
}
