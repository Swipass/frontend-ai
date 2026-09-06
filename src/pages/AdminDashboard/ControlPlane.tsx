// src/pages/AdminDashboard/ControlPlane.tsx
// Super-admin runtime control plane: manage credentials, chains, the address
// blacklist, routing and fee tunables, and the global emergency pause, all
// without a redeploy.
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, Toggle, ConfirmDialog, inputCls } from './shared'

/* ---------------------------------- Credentials --------------------------- */
function Credentials() {
  const [creds, setCreds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    adminService.listCredentials().then(d => setCreds(d.credentials || d.items || d || [])).catch(() => setCreds([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async (name: string) => {
    const value = (drafts[name] || '').trim()
    if (!value) return
    setBusy(true)
    try {
      await adminService.setCredential(name, value)
      setDrafts(d => ({ ...d, [name]: '' }))
      await load()
      toast.success(`${name} saved`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save credential')
    } finally {
      setBusy(false)
    }
  }

  const del = async (name: string) => {
    setBusy(true)
    try {
      await adminService.deleteCredential(name)
      setConfirmDel(null)
      await load()
      toast.success(`${name} cleared`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to clear credential')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <p className="text-xs text-light-grey-1 mb-4 leading-relaxed">
        Set or rotate provider and integration keys at runtime. Values are stored securely and never shown again once saved.
      </p>
      {creds.length === 0 ? (
        <EmptyState title="No managed credentials" hint="No credential slots are registered." />
      ) : (
        <div className="space-y-3">
          {creds.map(c => {
            const name = c.name || c.key
            const isSet = c.is_set ?? c.set ?? !!c.masked
            return (
              <div key={name} className="border border-dark-grey-3 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono text-sm text-light-grey-3">{name}</div>
                    <div className="flex items-center gap-2 text-xs text-light-grey-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSet ? 'bg-light-grey-2' : 'bg-mid-grey'}`} />
                      {isSet ? `Set${c.masked ? ` · ${c.masked}` : ''}` : 'Not set'}
                      {c.source && <span className="uppercase tracking-wider">· {c.source}</span>}
                    </div>
                  </div>
                  {isSet && (
                    <button
                      onClick={() => setConfirmDel(name)}
                      className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition self-start"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={drafts[name] || ''}
                    onChange={e => setDrafts(d => ({ ...d, [name]: e.target.value }))}
                    placeholder={isSet ? 'Enter new value to rotate' : 'Enter value'}
                    className={inputCls}
                  />
                  <button
                    onClick={() => save(name)}
                    disabled={busy || !(drafts[name] || '').trim()}
                    className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-40 whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Clear credential"
        message={<>Clear <b className="text-light-grey-3">{confirmDel}</b>? Any integration relying on it will stop working.</>}
        confirmLabel="Clear"
        busy={busy}
        onConfirm={() => confirmDel && del(confirmDel)}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}

/* ------------------------------------ Chains ------------------------------ */
function Chains() {
  const [chains, setChains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    adminService.listChains().then(d => setChains(d.chains || d.items || d || [])).catch(() => setChains([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const toggle = async (key: string, current: boolean) => {
    setChains(prev => prev.map(c => ((c.key || c.chain_key) === key ? { ...c, is_active: !current } : c)))
    try {
      await adminService.setChainActive(key, !current)
      toast.success(`${key} ${!current ? 'enabled' : 'disabled'}`)
    } catch (e: any) {
      setChains(prev => prev.map(c => ((c.key || c.chain_key) === key ? { ...c, is_active: current } : c)))
      toast.error(e?.message || 'Failed to toggle chain')
    }
  }

  if (loading) return <Loading />
  if (chains.length === 0) return <EmptyState title="No chains" hint="No chains are registered." />

  return (
    <div className="space-y-3">
      {chains.map(c => {
        const key = c.key || c.chain_key || c.name
        const active = c.is_active ?? c.active ?? false
        return (
          <div key={key} className="border border-dark-grey-3 rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-sm font-semibold text-almost-white">{c.name || key}</div>
              <div className="text-xs text-light-grey-1 mt-0.5 font-mono">{key}{c.chain_id ? ` · id ${c.chain_id}` : ''}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-light-grey-1">{active ? 'On' : 'Off'}</span>
              <Toggle on={active} onClick={() => toggle(key, active)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------------- Blacklist ----------------------------- */
function Blacklist() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const load = () =>
    adminService.listBlacklist().then(d => setList(d.blacklist || d.addresses || d.items || d || [])).catch(() => setList([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!address.trim()) return
    setBusy(true)
    try {
      await adminService.addBlacklist(address.trim(), reason.trim() || undefined)
      setAddress(''); setReason('')
      await load()
      toast.success('Address blacklisted')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add address')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (addr: string) => {
    setBusy(true)
    try {
      await adminService.removeBlacklist(addr)
      setConfirmRemove(null)
      await load()
      toast.success('Address removed')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove address')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="border border-dark-grey-3 rounded-lg p-4 mb-4 space-y-2">
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x address to block" className={inputCls} />
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" className={inputCls} />
          <button onClick={add} disabled={busy || !address.trim()} className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-40 whitespace-nowrap">
            Add to Blacklist
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Blacklist is empty" hint="No addresses are currently blocked." />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Added</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b, i) => {
                const addr = typeof b === 'string' ? b : b.address
                return (
                  <tr key={addr || i} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                    <td className="p-3"><code className="text-xs text-light-grey-3 break-all">{addr}</code></td>
                    <td className="p-3 text-light-grey-1">{b.reason || '-'}</td>
                    <td className="p-3 text-light-grey-1">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setConfirmRemove(addr)}
                        className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove from blacklist"
        message={<>Unblock <code className="text-light-grey-3 break-all">{confirmRemove}</code>? It will be allowed to transact again.</>}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => confirmRemove && remove(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}

/* ------------------------------------ System ------------------------------ */
function SystemControls() {
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmPause, setConfirmPause] = useState(false)

  useEffect(() => {
    adminService.getOverview().then(d => setPaused(!!d.system_paused)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const doToggle = async () => {
    setBusy(true)
    try {
      await adminService.pauseSystem(!paused)
      setPaused(!paused)
      setConfirmPause(false)
      toast.success(paused ? 'System resumed' : 'System paused')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to change system state')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="border border-dark-grey-3 rounded-lg p-5">
      <div className="font-display text-base font-semibold text-almost-white mb-2">Global Circuit Breaker</div>
      <p className="text-sm text-light-grey-1 leading-relaxed mb-4">
        When paused, every /v1/intent request is rejected with 503. Use this only for emergency maintenance.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-dark-grey-3 rounded">
          <span className={`w-2 h-2 rounded-full ${paused ? 'bg-mid-grey' : 'bg-light-grey-2 animate-pulse'}`} />
          <span className="text-xs uppercase tracking-wider text-light-grey-1">System {paused ? 'Paused' : 'Live'}</span>
        </div>
        <button
          onClick={() => (paused ? doToggle() : setConfirmPause(true))}
          disabled={busy}
          className={
            paused
              ? 'sw-btn sw-btn-primary text-xs py-1.5 px-4'
              : 'text-xs uppercase tracking-wider py-1.5 px-4 rounded border border-mid-grey text-almost-white hover:bg-dark-grey-3 transition'
          }
        >
          {busy ? '...' : paused ? 'Resume System' : 'Pause System'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmPause}
        title="Pause the platform"
        message="This immediately rejects all intent requests platform-wide until you resume. Continue?"
        confirmLabel="Pause System"
        busy={busy}
        onConfirm={doToggle}
        onCancel={() => setConfirmPause(false)}
      />
    </div>
  )
}

/* ----------------------------------- Tunables ----------------------------- */
// The knobs that decide how routing behaves and what the platform charges.
// Values outside their bounds are clamped by the backend rather than rejected,
// so a mistyped number degrades routing instead of breaking it.
const TUNABLE_FIELDS: { key: string; label: string; hint: string; step: number }[] = [
  { key: 'weight_output', label: 'Output weight', hint: 'How much the guaranteed output decides the route.', step: 0.05 },
  { key: 'weight_speed', label: 'Speed weight', hint: 'How much settlement time decides the route.', step: 0.05 },
  { key: 'weight_reliability', label: 'Reliability weight', hint: 'How much settled performance decides the route.', step: 0.05 },
  { key: 'max_slippage_bps', label: 'Max slippage (bps)', hint: 'The slippage cap sent to every provider.', step: 5 },
  { key: 'quote_ttl_seconds', label: 'Quote TTL (seconds)', hint: 'How long a quote stays valid before a refresh.', step: 5 },
  { key: 'direct_user_fee_percent', label: 'Direct user fee (%)', hint: 'Charged on traffic with no API key.', step: 0.01 },
  { key: 'developer_fee_percent', label: 'Developer fee (%)', hint: 'Charged on traffic from a developer project.', step: 0.01 },
  { key: 'developer_revenue_share', label: 'Developer revenue share', hint: 'Fraction of the developer fee paid out, unless a project overrides it.', step: 0.05 },
]

function Tunables() {
  const [values, setValues] = useState<Record<string, any>>({})
  const [bounds, setBounds] = useState<Record<string, [number, number]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState<Record<string, number | boolean>>({})

  const load = () => {
    setLoading(true)
    adminService
      .getTunables()
      .then(d => {
        setValues(d.tunables || {})
        setBounds(d.bounds || {})
        setDirty({})
      })
      .catch(() => setValues({}))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const save = async () => {
    if (Object.keys(dirty).length === 0) return
    setSaving(true)
    try {
      const res = await adminService.updateTunables(dirty)
      setValues(res.tunables || {})
      setDirty({})
      toast.success('Tunables updated. In force on the next intent.')
    } catch (e: any) {
      toast.error(e?.message || 'Could not update tunables')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  const weightTotal =
    Number(dirty.weight_output ?? values.weight_output ?? 0) +
    Number(dirty.weight_speed ?? values.weight_speed ?? 0) +
    Number(dirty.weight_reliability ?? values.weight_reliability ?? 0)

  return (
    <div className="border border-dark-grey-3 rounded-lg p-5">
      <div className="font-display text-base font-semibold text-almost-white mb-2">Routing and fees</div>
      <p className="text-sm text-light-grey-1 leading-relaxed mb-5">
        These take effect on the next intent, with no restart. Weights are normalized, so they do not have to sum to one.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {TUNABLE_FIELDS.map(f => {
          const bound = bounds[f.key]
          const current = dirty[f.key] ?? values[f.key] ?? ''
          return (
            <div key={f.key}>
              <label className="text-xs uppercase tracking-wider text-light-grey-1 block mb-1">{f.label}</label>
              <input
                type="number"
                step={f.step}
                value={String(current)}
                onChange={e => setDirty({ ...dirty, [f.key]: Number(e.target.value) })}
                className={inputCls}
              />
              <p className="text-xs text-light-grey-1 mt-1 leading-relaxed">
                {f.hint}
                {bound && ` Allowed ${bound[0]} to ${bound[1]}.`}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-dark-grey-3">
        <div className="flex items-center gap-3">
          <Toggle
            on={!!(dirty.require_simulation ?? values.require_simulation)}
            onClick={() =>
              setDirty({
                ...dirty,
                require_simulation: !(dirty.require_simulation ?? values.require_simulation),
              })
            }
          />
          <div>
            <div className="text-xs uppercase tracking-wider text-light-grey-2">Require simulation</div>
            <p className="text-xs text-light-grey-1">
              Skip any route whose calldata reverts in the pre-flight check before the user signs.
            </p>
          </div>
        </div>
        <div className="text-xs text-light-grey-1 whitespace-nowrap">
          Weights total {weightTotal.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={save}
          disabled={saving || Object.keys(dirty).length === 0}
          className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-40"
        >
          {saving ? 'Saving...' : `Save ${Object.keys(dirty).length || ''} change${Object.keys(dirty).length === 1 ? '' : 's'}`}
        </button>
        <button onClick={load} disabled={saving} className="sw-btn sw-btn-ghost text-xs py-2 px-4">
          Discard
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------ Shell ------------------------------- */

const TABS = [
  { key: 'credentials', label: 'Credentials' },
  { key: 'chains', label: 'Chains' },
  { key: 'blacklist', label: 'Blacklist' },
  { key: 'tunables', label: 'Routing & Fees' },
  { key: 'system', label: 'System' },
]

export default function ControlPlane() {
  const [tab, setTab] = useState('credentials')
  return (
    <div>
      <PageTitle title="Control Plane" subtitle="Runtime configuration. Manage keys, chains and safety controls without a redeploy." />

      <div className="flex flex-wrap gap-2 mb-6 border-b border-dark-grey-3">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs uppercase tracking-wider px-3 py-2 -mb-px border-b-2 transition ${
              tab === t.key ? 'border-light-grey-3 text-almost-white' : 'border-transparent text-light-grey-1 hover:text-light-grey-3'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'credentials' && <Credentials />}
      {tab === 'chains' && <Chains />}
      {tab === 'blacklist' && <Blacklist />}
      {tab === 'tunables' && <Tunables />}
      {tab === 'system' && <SystemControls />}
    </div>
  )
}
