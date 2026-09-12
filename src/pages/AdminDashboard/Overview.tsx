// src/pages/AdminDashboard/Overview.tsx
// The command center: platform state, what needs attention, the window's
// numbers against the previous window, and where the traffic went.
import { useCallback, useState } from 'react'
import { adminService } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Section, Segmented, PERIODS, TimeSeries } from './shared'
import { useLoad } from './hooks'
import { StatusStrip } from './overview/StatusStrip'
import { Alerts } from './overview/Alerts'
import { Kpis } from './overview/Kpis'
import { Breakdowns } from './overview/Breakdowns'
import { RecentIntents, RecentAudit } from './overview/Recent'

export default function Overview() {
  const [days, setDays] = useState(30)
  const fetcher = useCallback(() => adminService.getDashboard(days), [days])
  const { data, loading, error } = useLoad(fetcher, 'Could not load the command center')

  const period = <Segmented value={days} options={PERIODS} onChange={setDays} label="Period" />

  if (loading && !data) return <><PageTitle title="Overview" right={period} /><Loading /></>
  if (!data) {
    return (
      <>
        <PageTitle title="Overview" right={period} />
        <EmptyState title="The command center is not available" hint={error || 'The dashboard endpoint did not answer.'} />
      </>
    )
  }

  const hasDaily = (data.daily || []).some(d => d.intents > 0 || d.volume_usd > 0)

  return (
    <div>
      <PageTitle title="Overview" subtitle={`Platform state and the last ${data.window_days} days against the ${data.window_days} before.`} right={period} />

      <StatusStrip status={data.status} />
      <Alerts alerts={data.alerts || []} />
      <Kpis kpis={data.kpis} previous={data.previous || {}} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Section title="Intents per day" subtitle="Completed and failed, stacked">
          {hasDaily ? (
            <TimeSeries data={data.daily} type="bar" series={[{ key: 'completed', name: 'Completed' }, { key: 'failed', name: 'Failed' }]} />
          ) : (
            <p className="py-10 text-center text-[0.84rem] text-[color:var(--ink-4)]">No intents in this period.</p>
          )}
        </Section>
        <Section title="Volume per day" subtitle="USD routed">
          {hasDaily ? (
            <TimeSeries data={data.daily} series={[{ key: 'volume_usd', name: 'Volume USD' }]} money />
          ) : (
            <p className="py-10 text-center text-[0.84rem] text-[color:var(--ink-4)]">No volume in this period.</p>
          )}
        </Section>
      </div>

      <Breakdowns data={data} />

      <div className="flex flex-col gap-4">
        <RecentIntents rows={data.recent_intents || []} />
        <RecentAudit rows={data.recent_audit || []} />
      </div>
    </div>
  )
}
