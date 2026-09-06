// src/pages/AdminDashboard/Analytics.tsx
import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { adminService } from '../../services/platformService'
import { PageTitle, StatTile, Loading, EmptyState, CHART, ChartTooltip, fmtUsd, fmtNum, pct } from './shared'

function asArray(v: any): any[] {
  return Array.isArray(v) ? v : []
}

export default function Analytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getAnalytics().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const providers = useMemo(() => {
    const rows = asArray(data?.providers || data?.provider_stats)
    return rows.map((p: any) => ({
      name: p.provider || p.name || p.display_name || '?',
      success: Number(p.success_rate ?? p.success ?? 0),
      truth: Number(p.avg_truth_return_bps ?? p.truth_return_bps ?? p.truth_bps ?? 0),
      count: Number(p.count ?? p.transactions ?? p.total ?? 0),
    }))
  }, [data])

  const chains = useMemo(() => {
    const rows = asArray(data?.chains || data?.chain_stats)
    return rows.map((c: any) => ({
      name: c.chain || c.name || c.key || '?',
      count: Number(c.count ?? c.transactions ?? c.total ?? 0),
      volume: Number(c.volume_usd ?? c.volume ?? 0),
    }))
  }, [data])

  const totals = data?.totals || data || {}

  if (loading) return <><PageTitle title="Analytics" /><Loading /></>

  const hasAny = providers.length > 0 || chains.length > 0

  return (
    <div>
      <PageTitle title="Analytics" subtitle="Provider quality, chain distribution and platform totals." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Transactions" value={fmtNum(totals.total_transactions ?? totals.transactions)} />
        <StatTile label="Volume" value={fmtUsd(totals.total_volume_usd ?? totals.volume_usd, 0)} />
        <StatTile label="Fees" value={fmtUsd(totals.total_fees_usd ?? totals.fees_usd)} />
        <StatTile label="Success Rate" value={pct(totals.success_rate)} />
      </div>

      {!hasAny ? (
        <EmptyState title="No analytics yet" hint="Provider and chain breakdowns appear once transactions flow through the platform." />
      ) : (
        <div className="space-y-6">
          {providers.length > 0 && (
            <div className="dash-card">
              <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-4">Provider success rate</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={providers} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART.axis} tick={{ fontSize: 10 }} />
                  <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1a1a1a' }} />
                  <Bar dataKey="success" name="Success %" fill={CHART.series[0]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-light-grey-1 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-2 text-left">Provider</th>
                      <th className="p-2 text-left">Success</th>
                      <th className="p-2 text-left">Truth Return</th>
                      <th className="p-2 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map(p => (
                      <tr key={p.name} className="border-t border-dark-grey-3">
                        <td className="p-2 text-light-grey-3">{p.name}</td>
                        <td className="p-2 text-light-grey-2">{pct(p.success)}</td>
                        <td className="p-2 text-light-grey-2">{p.truth.toFixed(1)} bps</td>
                        <td className="p-2 text-light-grey-2">{fmtNum(p.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chains.length > 0 && (
            <div className="dash-card">
              <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-4">Volume by chain</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chains} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART.axis} tick={{ fontSize: 10 }} />
                  <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1a1a1a' }} />
                  <Bar dataKey="volume" name="Volume USD" fill={CHART.series[1]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
