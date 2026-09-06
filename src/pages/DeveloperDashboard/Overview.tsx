// src/pages/DeveloperDashboard/Overview.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { platformService } from '../../services/platformService'
import { config } from '../../config'
import { PageTitle, StatTile, Loading, fmtUsd, fmtNum, CopyButton } from './shared'

function apiBase(): string {
  return config.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '')
}

export default function Overview() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    platformService.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalEarned = projects.reduce((s, p) => s + (p.total_earned || 0), 0)
  const totalPending = projects.reduce((s, p) => s + (p.pending_balance || 0), 0)
  const totalVolume = projects.reduce((s, p) => s + (p.total_volume_usd || 0), 0)
  const totalTx = projects.reduce((s, p) => s + (p.transaction_count || p.tx_count || 0), 0)

  // Use a real key prefix from an existing project, never a fake key.
  const keyPrefix = projects.find(p => p.api_key_prefix)?.api_key_prefix
  const keySample = keyPrefix ? `${keyPrefix}...` : 'YOUR_API_KEY'
  const base = apiBase()

  const curl = `curl -X POST ${base}/v1/intent \\
  -H "X-API-Key: ${keySample}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Bridge 1 ETH to Polygon",
    "destination_address": "0x..."
  }'`

  if (loading) return <><PageTitle title="Overview" /><Loading /></>

  return (
    <div>
      <PageTitle title="Overview" subtitle="Aggregate performance across all of your projects." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Earned" value={fmtUsd(totalEarned)} />
        <StatTile label="Pending Balance" value={fmtUsd(totalPending)} hint="Available at $50" />
        <StatTile label="Total Volume" value={fmtUsd(totalVolume, 0)} />
        <StatTile label="Transactions" value={fmtNum(totalTx)} />
      </div>

      <div className="dash-card mb-6">
        <div className="flex items-center justify-between pb-2 border-b border-dark-grey-3 mb-3">
          <div className="text-xs uppercase tracking-wider text-light-grey-1">Quick Start</div>
          <CopyButton text={curl} label="Copy curl" />
        </div>
        {!keyPrefix && (
          <p className="text-xs text-light-grey-1 mb-3">
            Create a project to get a live API key, then drop it into the request below.
          </p>
        )}
        <pre className="font-mono text-xs sm:text-sm text-light-grey-2 leading-relaxed bg-dark-grey-2 p-4 rounded-md overflow-x-auto">
{curl}
        </pre>
        <div className="text-xs text-light-grey-1 mt-3">
          Base URL: <code className="bg-dark-grey-2 px-1 rounded text-light-grey-2">{base || 'window.location.origin'}</code>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/dashboard/developer/projects" className="dash-card hover:border-mid-grey transition-colors">
          <div className="font-display text-base font-semibold text-almost-white mb-1">Projects</div>
          <div className="text-xs text-light-grey-1">Create projects and manage API keys.</div>
        </Link>
        <Link to="/dashboard/developer/usage" className="dash-card hover:border-mid-grey transition-colors">
          <div className="font-display text-base font-semibold text-almost-white mb-1">Usage & Analytics</div>
          <div className="text-xs text-light-grey-1">Requests, volume and success rate.</div>
        </Link>
        <Link to="/dashboard/developer/payouts" className="dash-card hover:border-mid-grey transition-colors">
          <div className="font-display text-base font-semibold text-almost-white mb-1">Payouts</div>
          <div className="text-xs text-light-grey-1">Withdraw earnings from $50.</div>
        </Link>
      </div>
    </div>
  )
}
