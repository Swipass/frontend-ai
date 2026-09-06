// src/pages/AdminDashboard/Overview.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import { PageTitle, StatTile, Loading, fmtUsd, fmtNum } from './shared'

export default function Overview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getOverview().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <><PageTitle title="System Overview" /><Loading /></>

  const s = stats || {}
  const paused = !!s.system_paused

  return (
    <div>
      <PageTitle
        title="System Overview"
        subtitle="Platform-wide totals and live status."
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 border border-dark-grey-3 rounded">
            <span className={`w-2 h-2 rounded-full ${paused ? 'bg-mid-grey' : 'bg-light-grey-2 animate-pulse'}`} />
            <span className="text-xs uppercase tracking-wider text-light-grey-1">{paused ? 'Paused' : 'Live'}</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile label="Total Transactions" value={fmtNum(s.total_transactions)} />
        <StatTile label="Total Volume" value={fmtUsd(s.total_volume_usd)} />
        <StatTile label="Total Fees" value={fmtUsd(s.total_fees_usd)} />
        <StatTile label="Total Users" value={fmtNum(s.total_users)} />
        <StatTile label="Total Projects" value={fmtNum(s.total_projects)} />
        <StatTile label="Total Payouts" value={fmtUsd(s.total_payouts_usd)} />
      </div>
    </div>
  )
}
