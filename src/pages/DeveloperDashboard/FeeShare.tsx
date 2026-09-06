// src/pages/DeveloperDashboard/FeeShare.tsx
import { useEffect, useState } from 'react'
import { platformService } from '../../services/platformService'
import { intentService, ChainInfo } from '../../services/intentService'
import { useFeeRates } from '../../hooks/useFeeRates'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, Field, inputCls } from './shared'

// Payout chains and tokens come from the API, which derives them from the
// providers Swipass actually routes through. A hardcoded list here would offer a
// payout chain the treasury cannot pay on the day the provider set changes.
const PAYOUT_TOKEN_LIMIT = 30

function FeeShareForm({ project, onSaved }: { project: any; onSaved: () => void }) {
  const [percent, setPercent] = useState<number>(project.fee_share_percent ?? 50)
  const [chains, setChains] = useState<ChainInfo[]>([])
  const [tokens, setTokens] = useState<string[]>([])
  const [token, setToken] = useState<string>(project.payout_token || 'USDC')
  const [chain, setChain] = useState<string>(project.payout_chain || 'polygon')

  // Payout chains: whatever Swipass routes on today.
  useEffect(() => {
    intentService.getChains().then(setChains).catch(() => setChains([]))
  }, [])

  // Payout tokens: the ones resolvable on the selected payout chain. Stablecoins
  // first, since that is what a payout is almost always taken in.
  useEffect(() => {
    if (!chain) return
    let cancelled = false
    intentService
      .getTokens(chain, undefined, PAYOUT_TOKEN_LIMIT)
      .then(page => {
        if (!cancelled) setTokens(page.tokens.map(t => t.symbol))
      })
      .catch(() => {
        if (!cancelled) setTokens([])
      })
    return () => {
      cancelled = true
    }
  }, [chain])
  const [wallet, setWallet] = useState<string>(project.payout_wallet || '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (percent < 0 || percent > 100) { toast.error('Fee share must be between 0 and 100'); return }
    setBusy(true)
    try {
      await platformService.updateFeeShare(project.id, {
        fee_share_percent: percent,
        payout_token: token,
        payout_chain: chain,
        payout_wallet: wallet.trim() || undefined,
      })
      toast.success('Fee-share settings saved')
      onSaved()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-card space-y-4">
      <div className="font-display text-base font-semibold text-almost-white">{project.name}</div>

      <Field label={`Fee share to end users: ${percent}%`} hint="Share of your 0.075% cut passed back to your users. You keep the rest.">
        <input
          type="range" min={0} max={100} step={1}
          value={percent}
          onChange={e => setPercent(Number(e.target.value))}
          className="w-full accent-light-grey-3"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Payout Token" hint={tokens.length ? undefined : 'Loading the tokens this chain supports...'}>
          <select value={token} onChange={e => setToken(e.target.value)} className={inputCls}>
            {/* The saved token stays selectable even if it falls off the list. */}
            {(tokens.includes(token) ? tokens : [token, ...tokens]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Payout Chain">
          <select value={chain} onChange={e => setChain(e.target.value)} className={inputCls}>
            {(chains.some(c => c.key === chain)
              ? chains
              : [{ key: chain, name: chain } as ChainInfo, ...chains]
            ).map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Payout Wallet" hint="Required before you can request a payout.">
        <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="0x..." className={inputCls} />
      </Field>

      <button onClick={save} disabled={busy} className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-50">
        {busy ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

export default function FeeShare() {
  // Live rates from /v1/stats: fees are admin-editable at runtime.
  const fees = useFeeRates()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    platformService.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  if (loading) return <><PageTitle title="Fee-share" /><Loading /></>

  return (
    <div>
      <PageTitle title="Fee-share & Payout" subtitle="Configure how earnings are split and where they are paid." />

      <div className="dash-card mb-6">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-2">How the fee works</div>
        <div className="text-sm text-light-grey-1 leading-relaxed space-y-1">
          <div>
            Swipass charges a flat {fees.developer || 'platform'} fee on every developer-driven
            transaction.
          </div>
          <div>
            By default that fee is split {fees.revenueShare || 'evenly'}: you earn{' '}
            {fees.developerCut || 'your share'}, the platform keeps the rest.
          </div>
          <div>
            Your fee-share percent decides how much of {fees.developerCut || 'your share'} you pass
            back to your users versus keep as revenue.
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects" hint="Create a project to configure fee-share and payout settings." />
      ) : (
        <div className="space-y-4">
          {projects.map(p => <FeeShareForm key={p.id} project={p} onSaved={load} />)}
        </div>
      )}
    </div>
  )
}
