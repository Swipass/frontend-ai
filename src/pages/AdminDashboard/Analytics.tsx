// src/pages/AdminDashboard/Analytics.tsx
// Platform-wide analytics: the funnel from intent to settlement, provider
// quality (success rate and truth return), and volume by route.
import { useCallback, useState } from 'react'
import { adminService } from '../../services/adminService'
import {
  PageTitle, Loading, EmptyState, Section, Segmented, PERIODS, KpiTile, DataTable,
  BreakdownBars, fmtNum, fmtUsd, pct, type Column,
} from './shared'
import { useLoad } from './hooks'
import { routeLabel } from './format'

interface ProviderRow {
  provider: string
  count: number
  success_rate: number
  avg_truth_return_bps: number
  window_days: number
}

export default function Analytics() {
  const [days, setDays] = useState(30)
  const fetcher = useCallback(
    () => Promise.all([adminService.getAnalytics(), adminService.getDashboard(days)]),
    [days],
  )
  const { data, loading, error } = useLoad(fetcher, 'Could not load analytics')

  const period = <Segmented value={days} options={PERIODS} onChange={setDays} label="Period" />

  if (loading && !data) return <><PageTitle title="Analytics" right={period} /><Loading /></>
  if (!data) {
    return (
      <>
        <PageTitle title="Analytics" right={period} />
        <EmptyState title="Analytics are not available" hint={error || 'The analytics endpoint did not answer.'} />
      </>
    )
  }

  const [analytics, dashboard] = data
  const totals = analytics.totals
  const providers: ProviderRow[] = analytics.per_provider || analytics.provider_stats || []
  const routes = dashboard.top_routes || []

  const COLUMNS: Column<ProviderRow>[] = [
    { key: 'provider', header: 'Provider', render: r => <span className="text-[color:var(--ink)]">{r.provider}</span> },
    { key: 'count', header: 'Settled', align: 'right', render: r => <span className="f-mono">{fmtNum(r.count)}</span> },
    { key: 'success_rate', header: 'Success rate', align: 'right', render: r => <span className="f-mono">{pct(r.success_rate)}</span> },
    { key: 'avg_truth_return_bps', header: 'Truth return', align: 'right', render: r => <span className="f-mono">{r.avg_truth_return_bps > 0 ? '+' : ''}{r.avg_truth_return_bps.toFixed(1)} bps</span> },
  ]

  return (
    <div>
      <PageTitle title="Analytics" subtitle="Reconciled against settled outcomes, not estimates." right={period} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Intents" value={fmtNum(totals.total_intents)} hint={`over ${totals.reconciled_intents ? fmtNum(totals.reconciled_intents) + ' reconciled' : 'window'}`} />
        <KpiTile label="Completed" value={fmtNum(totals.completed)} />
        <KpiTile label="Failed" value={fmtNum(totals.failed)} />
        <KpiTile label="Success rate" value={pct(totals.success_rate)} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Section title="Volume" subtitle={`${fmtUsd(totals.total_volume_usd, 0)} routed, ${fmtUsd(totals.total_fees_usd)} in fees`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="kicker">Volume</div>
              <div className="mt-2 text-[1.6rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{fmtUsd(totals.total_volume_usd, 0)}</div>
            </div>
            <div>
              <div className="kicker">Fees</div>
              <div className="mt-2 text-[1.6rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{fmtUsd(totals.total_fees_usd)}</div>
            </div>
          </div>
        </Section>
        <Section title="Volume by route" subtitle="Chain pairs, this period">
          <BreakdownBars
            rows={routes.map(r => ({ label: routeLabel(r.from_chain, r.to_chain), value: r.volume_usd, sub: `${fmtNum(r.intents)} intents` }))}
            format={n => fmtUsd(n, 0)}
          />
        </Section>
      </div>

      <Section title="Provider quality" subtitle="Success rate and truth return against the quote, from settled outcomes only.">
        {providers.length === 0 ? (
          <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">No settled outcomes have been reconciled yet.</p>
        ) : (
          <DataTable columns={COLUMNS} rows={providers} rowKey={r => r.provider} />
        )}
      </Section>
    </div>
  )
}
