// src/pages/DeveloperDashboard/Usage.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { platformService } from '../../services/platformService'
import { PageTitle, StatTile, Loading, EmptyState, CHART, ChartTooltip, fmtUsd, fmtNum } from './shared'

// Pull a time series out of whatever shape the endpoint returns.
function normalizeSeries(raw: any): any[] {
  if (!raw) return []
  const arr =
    (Array.isArray(raw) && raw) ||
    raw.daily || raw.usage || raw.series || raw.data || raw.points ||
    raw.requests_over_time || raw.timeline || []
  if (!Array.isArray(arr)) return []
  return arr.map((p: any) => ({
    label: String(p.date || p.day || p.label || p.timestamp || '').slice(5, 10) || '',
    requests: Number(p.requests ?? p.count ?? p.request_count ?? p.total ?? 0),
    volume: Number(p.volume_usd ?? p.volume ?? 0),
    success: Number(p.success_rate ?? p.success ?? 0),
  }))
}

const DAY_OPTIONS = [7, 30, 90]

export default function Usage() {
  const [projects, setProjects] = useState<any[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [days, setDays] = useState(30)
  const [usage, setUsage] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      platformService.listProjects().catch(() => []),
      platformService.getAnalytics().catch(() => null),
    ]).then(([ps, an]) => {
      setProjects(ps || [])
      if (ps && ps[0]) setProjectId(ps[0].id)
      setAnalytics(an)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!projectId) { setUsage(null); return }
    platformService.getUsage(projectId, days).then(setUsage).catch(() => setUsage(null))
  }, [projectId, days])

  const series = useMemo(() => normalizeSeries(usage), [usage])
  const hasSeries = series.some(p => p.requests > 0 || p.volume > 0)

  const totalReq = series.reduce((s, p) => s + p.requests, 0)
  const totalVol = series.reduce((s, p) => s + p.volume, 0)
  const avgSuccess = series.length
    ? series.reduce((s, p) => s + p.success, 0) / series.filter(p => p.success > 0).length || 0
    : 0

  // Aggregate analytics fallbacks (dev-wide).
  const anTotalReq = analytics?.total_requests ?? analytics?.requests ?? totalReq
  const anVolume = analytics?.total_volume_usd ?? analytics?.volume_usd ?? totalVol
  const anSuccess = analytics?.success_rate ?? (avgSuccess || 0)

  if (loading) return <><PageTitle title="Usage & Analytics" /><Loading /></>

  if (projects.length === 0) {
    return (
      <div>
        <PageTitle title="Usage & Analytics" />
        <EmptyState title="No data to chart yet" hint="Create a project and start sending intents to see requests, volume and success rate here." />
      </div>
    )
  }

  return (
    <div>
      <PageTitle
        title="Usage & Analytics"
        subtitle="Requests, volume and success rate over time."
        right={
          <div className="flex items-center gap-2">
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="bg-dark-grey-2 border border-mid-grey rounded px-2 py-1.5 text-xs text-light-grey-2 font-mono focus:outline-none focus:border-light-grey-1"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex border border-mid-grey rounded overflow-hidden">
              {DAY_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`text-xs px-2.5 py-1.5 font-mono ${days === d ? 'bg-dark-grey-3 text-almost-white' : 'text-light-grey-1 hover:bg-dark-grey-2'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Requests" value={fmtNum(anTotalReq)} hint={`Last ${days} days`} />
        <StatTile label="Volume" value={fmtUsd(anVolume, 0)} hint={`Last ${days} days`} />
        <StatTile label="Success Rate" value={`${(anSuccess <= 1 ? anSuccess * 100 : anSuccess).toFixed(1)}%`} />
      </div>

      {!hasSeries ? (
        <EmptyState title="No usage in this window" hint="Once this project processes intents, requests and volume will chart here." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Requests over time">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.fill} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART.fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" stroke={CHART.axis} tick={{ fontSize: 10 }} />
                <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={36} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="requests" name="Requests" stroke={CHART.series[0]} fill="url(#reqFill)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Volume over time">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" stroke={CHART.axis} tick={{ fontSize: 10 }} />
                <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1a1a1a' }} />
                <Bar dataKey="volume" name="Volume USD" fill={CHART.series[1]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {series.some(p => p.success > 0) && (
            <ChartCard title="Success rate">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" stroke={CHART.axis} tick={{ fontSize: 10 }} />
                  <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={36} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="success" name="Success %" stroke={CHART.series[0]} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-card">
      <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-4">{title}</div>
      {children}
    </div>
  )
}
