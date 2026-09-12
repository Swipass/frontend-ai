// src/pages/AdminDashboard/overview/Kpis.tsx
// The window's headline numbers, each against the window before it.
import type { DashboardKpis } from '../../../services/adminService'
import { KpiTile, change, fmtNum, fmtUsd, pct } from '../shared'

export function Kpis({ kpis, previous }: { kpis: DashboardKpis; previous: Partial<DashboardKpis> }) {
  const d = (key: keyof DashboardKpis) => change(kpis[key], previous[key])
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiTile label="Intents" value={fmtNum(kpis.intents)} delta={d('intents')} hint={`${fmtNum(kpis.completed)} completed, ${fmtNum(kpis.failed)} failed`} />
      <KpiTile label="Volume" value={fmtUsd(kpis.volume_usd, 0)} delta={d('volume_usd')} />
      <KpiTile label="Fees" value={fmtUsd(kpis.fees_usd)} delta={d('fees_usd')} />
      <KpiTile label="Success rate" value={pct(kpis.success_rate)} delta={d('success_rate')} />
      <KpiTile label="Unique wallets" value={fmtNum(kpis.unique_wallets)} delta={d('unique_wallets')} />
      <KpiTile label="Active projects" value={fmtNum(kpis.active_projects)} delta={d('active_projects')} />
      <KpiTile label="New users" value={fmtNum(kpis.new_users)} delta={d('new_users')} />
      <KpiTile label="Pending payouts" value={fmtUsd(kpis.pending_payouts_usd)} hint={`${fmtNum(kpis.pending_payouts_count)} waiting`} />
    </div>
  )
}
