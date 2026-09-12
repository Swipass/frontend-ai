// src/pages/DeveloperDashboard/Usage.tsx
// One project over a window: requests, volume and fees per day, and where
// they went (provider, route, token, outcome). All from the usage endpoint.
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { platformService, type ProjectUsage } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, Segmented, PERIODS, KpiTile, Section, TimeSeries, BreakdownBars, fmtUsd, fmtNum, pct } from './shared'
import { routeLabel } from './format'
import { useProjects, useProjectParam } from './useProjects'
import { ProjectSelect } from './components/ProjectSelect'

const usd = (n: number) => fmtUsd(n, 0)

export default function Usage() {
  const { projects, loading: loadingProjects } = useProjects()
  const [projectId, setProjectId] = useProjectParam(projects)
  const [days, setDays] = useState(30)
  const [usage, setUsage] = useState<ProjectUsage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setLoading(true)
    platformService
      .getUsage(projectId, days)
      .then(u => !cancelled && setUsage(u))
      .catch((e: Error) => {
        if (cancelled) return
        setUsage(null)
        toast.error(e?.message || 'Could not load usage')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [projectId, days])

  const daily = usage?.daily || []
  const totals = useMemo(() => {
    const requests = daily.reduce((s, d) => s + d.requests, 0)
    const completed = daily.reduce((s, d) => s + d.completed, 0)
    return { requests, completed, rate: requests ? completed / requests : null }
  }, [daily])
  const active = daily.some(d => d.requests > 0)

  const providers = (usage?.by_provider || []).map(r => ({ label: r.provider, value: r.requests, sub: usd(r.volume_usd) }))
  const routes = (usage?.by_route || []).map(r => ({ label: routeLabel(r.from_chain, r.to_chain), value: r.requests, sub: usd(r.volume_usd) }))
  const tokens = (usage?.by_token || []).map(r => ({ label: r.token, value: r.requests, sub: usd(r.volume_usd) }))
  const statuses = Object.entries(usage?.by_status || {})
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const header = (
    <PageTitle
      title="Usage & Analytics"
      subtitle="Requests, volume and fees for one project over time."
      right={
        projects.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
            <Segmented value={days} options={PERIODS} onChange={setDays} label="Period" />
          </div>
        ) : undefined
      }
    />
  )

  if (loadingProjects) return <>{header}<Loading /></>
  if (projects.length === 0) {
    return (
      <>
        {header}
        <EmptyState title="No data to chart yet" hint="Create a project and start sending intents to see requests, volume and success rate here." />
      </>
    )
  }
  if (loading && !usage) return <>{header}<Loading /></>
  if (!usage) {
    return (
      <>
        {header}
        <EmptyState title="Usage could not be loaded" hint="The API did not answer. Try again in a moment." />
      </>
    )
  }

  return (
    <div>
      {header}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
        <KpiTile label="Requests" value={fmtNum(usage.total_requests)} hint={`Last ${usage.period_days} days`} />
        <KpiTile label="Volume" value={fmtUsd(usage.total_volume_usd, 0)} />
        <KpiTile label="Fees" value={fmtUsd(usage.total_fees_usd)} hint="Before your share is applied" />
        <KpiTile label="Success rate" value={totals.rate == null ? '-' : pct(totals.rate)} hint={totals.rate == null ? 'No requests in this window' : `${fmtNum(totals.completed)} of ${fmtNum(totals.requests)} completed`} />
      </div>

      {!active ? (
        <EmptyState title="No usage in this window" hint="Once this project processes intents, requests and volume chart here." />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Section title="Requests per day" subtitle="Completed and failed, stacked.">
            <TimeSeries data={daily} type="bar" series={[{ key: 'completed', name: 'Completed' }, { key: 'failed', name: 'Failed' }]} />
          </Section>
          <Section title="Volume per day" subtitle="USD routed through this project.">
            <TimeSeries data={daily} series={[{ key: 'volume_usd', name: 'Volume' }]} money />
          </Section>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Section title="By provider" subtitle="Requests, with volume routed.">
          <BreakdownBars rows={providers} />
        </Section>
        <Section title="By route" subtitle="Source to destination chain.">
          <BreakdownBars rows={routes} />
        </Section>
        <Section title="By token" subtitle="What users started from.">
          <BreakdownBars rows={tokens} />
        </Section>
        <Section title="By outcome" subtitle="Where each request ended.">
          <BreakdownBars rows={statuses} />
        </Section>
      </div>
    </div>
  )
}
