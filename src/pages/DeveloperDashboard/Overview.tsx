// src/pages/DeveloperDashboard/Overview.tsx
// Everything at a glance: what the platform is doing, this window against the
// last one, the daily shape, each project, and the latest requests. One call
// to /platform/overview feeds all of it.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { platformService, type DeveloperOverview, type OverviewProject, type RecentIntent } from '../../services/platformService'
import {
  PageTitle, Loading, EmptyState, Segmented, PERIODS, KpiTile, Section, DataTable, StatusBadge, TimeSeries,
  change, timeAgo, fmtUsd, fmtNum, pct, type Column,
} from './shared'
import { PlatformNotices } from './components/PlatformNotices'
import { Checklist } from './components/Checklist'
import { QuickStart } from './components/QuickStart'
import { RecentRequests } from './components/RecentRequests'
import { TraceModal, type TraceTarget } from './components/TraceModal'

const PROJECT_COLUMNS: Column<OverviewProject>[] = [
  {
    key: 'name',
    header: 'Project',
    render: p => (
      <Link to={`/dashboard/developer/requests?project=${p.id}`} className="text-[color:var(--ink)] hover:underline">
        {p.name}
      </Link>
    ),
  },
  { key: 'status', header: 'Status', render: p => <StatusBadge status={p.status} /> },
  { key: 'intents', header: 'Requests', align: 'right', className: 'f-mono', render: p => fmtNum(p.intents) },
  { key: 'volume', header: 'Volume', align: 'right', className: 'f-mono', render: p => fmtUsd(p.volume_usd) },
  { key: 'earned', header: 'Earned', align: 'right', className: 'f-mono', render: p => fmtUsd(p.earned_usd) },
  { key: 'last', header: 'Last request', className: 'f-mono whitespace-nowrap', render: p => timeAgo(p.last_request_at) },
]

export default function Overview() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<DeveloperOverview | null>(null)
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [trace, setTrace] = useState<TraceTarget | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    platformService
      .getOverview(days)
      .then(d => {
        if (cancelled) return
        setData(d)
        setFailed(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setFailed(true)
        toast.error(e?.message || 'Could not load the overview')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [days])

  // The quick start shows a real key prefix from one of the projects.
  useEffect(() => {
    platformService
      .listProjects()
      .then(list => setKeyPrefix(list.find(p => p.api_key_prefix)?.api_key_prefix || null))
      .catch(() => setKeyPrefix(null))
  }, [])

  const openTrace = (r: RecentIntent) => setTrace({ projectId: r.project_id, intent: r })

  const header = (
    <PageTitle
      title="Overview"
      subtitle="Across all of your projects."
      right={<Segmented value={days} options={PERIODS} onChange={setDays} label="Period" />}
    />
  )

  if (loading && !data) return <>{header}<Loading /></>
  if (!data) {
    return (
      <>
        {header}
        <EmptyState title="The overview could not be loaded" hint={failed ? 'The API did not answer. Try again in a moment.' : undefined} />
      </>
    )
  }

  // Lists default to empty so a partial answer renders its empty states
  // rather than nothing at all.
  const { kpis, previous, checklist, platform } = data
  const daily = data.daily || []
  const projects = data.projects || []
  const recent_intents = data.recent_intents || []
  const active = daily.some(d => d.intents > 0 || d.earned_usd > 0)

  return (
    <div>
      {header}
      <PlatformNotices platform={platform} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 sm:gap-4">
        <KpiTile label="Requests" value={fmtNum(kpis.intents)} delta={change(kpis.intents, previous?.intents)} hint={`${fmtNum(kpis.completed)} completed, ${fmtNum(kpis.failed)} failed`} />
        <KpiTile label="Success rate" value={pct(kpis.success_rate)} delta={change(kpis.success_rate, previous?.success_rate)} />
        <KpiTile label="Volume" value={fmtUsd(kpis.volume_usd, 0)} delta={change(kpis.volume_usd, previous?.volume_usd)} />
        <KpiTile label="Earned" value={fmtUsd(kpis.earned_usd)} delta={change(kpis.earned_usd, previous?.earned_usd)} hint={`Last ${data.window_days} days`} />
        <KpiTile label="Pending balance" value={fmtUsd(kpis.pending_balance_usd)} hint={platform ? `Paid out from ${fmtUsd(platform.minimum_payout_usd, 0)}` : undefined} />
        <KpiTile label="Lifetime earned" value={fmtUsd(kpis.total_earned_usd)} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Requests per day" subtitle="Completed and failed, stacked.">
          {active ? (
            <TimeSeries data={daily} type="bar" series={[{ key: 'completed', name: 'Completed' }, { key: 'failed', name: 'Failed' }]} />
          ) : (
            <p className="py-10 text-center text-[0.84rem] text-[color:var(--ink-4)]">No requests in this window.</p>
          )}
        </Section>
        <Section title="Earned per day" subtitle="Your share of the fees, in USD.">
          {active ? (
            <TimeSeries data={daily} series={[{ key: 'earned_usd', name: 'Earned' }]} money />
          ) : (
            <p className="py-10 text-center text-[0.84rem] text-[color:var(--ink-4)]">Nothing earned in this window.</p>
          )}
        </Section>
      </div>

      <Section title="Projects" subtitle={`This window, per project.`} className="mb-6">
        <DataTable
          columns={PROJECT_COLUMNS}
          rows={projects}
          rowKey={p => p.id}
          empty={
            <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">
              No projects yet.{' '}
              <Link to="/dashboard/developer/projects" className="text-[color:var(--ink-2)] underline decoration-white/20 underline-offset-2">
                Create one
              </Link>{' '}
              to get an API key.
            </p>
          }
        />
      </Section>

      <div className="mb-6">
        <RecentRequests rows={recent_intents} onOpen={openTrace} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {checklist && <Checklist checklist={checklist} />}
        <QuickStart keyPrefix={keyPrefix} />
      </div>

      <TraceModal target={trace} onClose={() => setTrace(null)} />
    </div>
  )
}
