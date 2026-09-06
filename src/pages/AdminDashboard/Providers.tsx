// src/pages/AdminDashboard/Providers.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, Toggle } from './shared'

// Normalize live-provider records across possible field names.
function norm(p: any) {
  const hasKey = p.has_key ?? p.is_configured ?? p.configured ?? (p.dormant === undefined ? undefined : !p.dormant)
  return {
    name: p.name || p.provider_name,
    display: p.display_name || p.name || p.provider_name,
    active: p.is_active ?? p.active ?? false,
    available: p.available ?? p.is_available ?? false,
    dormant: p.dormant ?? (hasKey === undefined ? undefined : !hasKey),
    weight: p.priority_weight ?? p.weight,
  }
}

export default function Providers() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    adminService
      .listLiveProviders()
      .then(d => setProviders((d.providers || d.items || d || []).map(norm)))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const toggle = async (name: string, current: boolean) => {
    setProviders(prev => prev.map(p => (p.name === name ? { ...p, active: !current } : p)))
    try {
      await adminService.toggleProvider(name, !current)
      toast.success(`${name} ${!current ? 'enabled' : 'disabled'}`)
    } catch (e: any) {
      setProviders(prev => prev.map(p => (p.name === name ? { ...p, active: current } : p)))
      toast.error(e?.message || 'Failed to toggle provider')
    }
  }

  return (
    <div>
      <PageTitle title="Providers" subtitle="Live availability and activation. Changes apply to new intents immediately." />

      {loading ? (
        <Loading />
      ) : providers.length === 0 ? (
        <EmptyState title="No providers" hint="No providers are registered on the platform yet." />
      ) : (
        <div className="space-y-3">
          {providers.map(p => (
            <div key={p.name} className="dash-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-display text-base font-semibold text-almost-white">{p.display}</div>
                  {p.dormant && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-mid-grey rounded text-light-grey-1">
                      Dormant · no key
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-light-grey-1 mt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-light-grey-2' : 'bg-mid-grey'}`} />
                    {p.available ? 'Available' : 'Unavailable'}
                  </span>
                  <span>{p.name}</span>
                  {p.weight != null && <span>Weight {p.weight}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-light-grey-1">{p.active ? 'On' : 'Off'}</span>
                <Toggle on={p.active} onClick={() => toggle(p.name, p.active)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
