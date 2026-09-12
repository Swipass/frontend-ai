// src/pages/AdminDashboard/Providers.tsx
// Every registered provider: real availability, activation, 30-day stats and a
// live probe that fetches one real quote so a key or RPC problem shows up here
// before a user hits it.
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { adminService, type LiveProvider, type ProbeResult } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Badge, Toggle, fmtNum, fmtUsd, pct } from './shared'
import { useLoad } from './hooks'

export default function Providers() {
  const fetcher = useCallback(() => adminService.listLiveProviders(), [])
  const { data, setData, loading, error } = useLoad(fetcher, 'Could not load providers')
  const [probing, setProbing] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, ProbeResult>>({})

  const providers = data?.providers || []

  const toggle = async (p: LiveProvider) => {
    setData(prev => (prev ? { providers: prev.providers.map(x => (x.name === p.name ? { ...x, active: !p.active } : x)) } : prev))
    try {
      await adminService.toggleProvider(p.name, !p.active)
      toast.success(`${p.display_name} ${!p.active ? 'enabled' : 'disabled'}`)
    } catch (e: any) {
      setData(prev => (prev ? { providers: prev.providers.map(x => (x.name === p.name ? { ...x, active: p.active } : x)) } : prev))
      toast.error(e?.message || 'Failed to toggle provider')
    }
  }

  const probe = async (name: string) => {
    setProbing(s => ({ ...s, [name]: true }))
    try {
      const res = await adminService.probeProvider(name)
      setResults(r => ({ ...r, [name]: res }))
      if (!res.ok) toast.error(res.error || 'Probe failed')
    } catch (e: any) {
      setResults(r => ({ ...r, [name]: { provider: name, ok: false, latency_ms: 0, route: '', to_amount: null, guaranteed_to_amount: null, error: e?.message || 'Probe failed', available: true } }))
    } finally {
      setProbing(s => ({ ...s, [name]: false }))
    }
  }

  if (loading && !data) return <><PageTitle title="Providers" /><Loading /></>
  if (providers.length === 0) {
    return (
      <>
        <PageTitle title="Providers" subtitle="Live availability, activation and 30-day performance." />
        <EmptyState title="No providers" hint={error || 'No providers are registered on the platform yet.'} />
      </>
    )
  }

  return (
    <div>
      <PageTitle title="Providers" subtitle="Live availability, activation and 30-day performance. Probe fetches one real quote right now." />

      <div className="flex flex-col gap-3">
        {providers.map(p => {
          const result = results[p.name]
          const isProbing = !!probing[p.name]
          return (
            <div key={p.name} className="dash-card flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.98rem] text-[color:var(--ink)]">{p.display_name}</span>
                    <Badge tone={p.available ? 'neutral' : 'muted'}>{p.available ? 'available' : 'missing key/rpc'}</Badge>
                    <Badge tone="muted">{p.kind}</Badge>
                  </div>
                  <div className="f-mono mt-1 text-[0.74rem] text-[color:var(--ink-4)]">
                    {p.name} · {(p.supported_chains || []).join(', ') || 'no chains'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => probe(p.name)}
                    disabled={isProbing}
                    className="pill pill-dark h-9 disabled:opacity-50"
                  >
                    {isProbing ? 'Probing...' : 'Probe'}
                  </button>
                  <span className="f-mono text-[0.7rem] uppercase tracking-[0.08em] text-[color:var(--ink-4)]">{p.active ? 'on' : 'off'}</span>
                  <Toggle on={!!p.active} onClick={() => toggle(p)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
                <Stat label="Intents (30d)" value={fmtNum(p.stats?.intents_30d)} />
                <Stat label="Volume (30d)" value={fmtUsd(p.stats?.volume_usd_30d, 0)} />
                <Stat label="Success rate" value={p.stats?.success_rate == null ? '-' : pct(p.stats.success_rate)} />
                <Stat label="Truth return" value={p.stats?.avg_truth_return_bps == null ? '-' : `${p.stats.avg_truth_return_bps.toFixed(0)} bps`} />
              </div>

              {result && (
                <div className={`rounded-xl border px-4 py-3 text-[0.8rem] ${result.ok ? 'border-white/[0.1] bg-white/[0.03]' : 'border-white/30'}`}>
                  {result.ok ? (
                    <span className="text-[color:var(--ink-2)]">
                      Quoted <span className="f-mono">{result.route}</span> in {result.latency_ms}ms → {result.to_amount} (guaranteed {result.guaranteed_to_amount})
                    </span>
                  ) : (
                    <span className="text-[color:var(--ink-3)]">{result.error || 'Probe failed'}{result.route ? ` · ${result.route}` : ''}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="f-mono text-[0.64rem] uppercase tracking-[0.08em] text-[color:var(--ink-4)]">{label}</div>
      <div className="mt-1 text-[0.92rem] text-[color:var(--ink-2)]">{value}</div>
    </div>
  )
}
