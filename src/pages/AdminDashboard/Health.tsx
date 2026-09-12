// src/pages/AdminDashboard/Health.tsx
// Live checks of everything the pipeline depends on. Refreshes every 30 s
// while the page is open, or on demand.
import { useCallback, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, Section, fmtNum } from './shared'
import { useLoad } from './hooks'
import { fullDate } from './format'
import { Services } from './health/Services'
import { RpcTable } from './health/RpcTable'
import { ProviderAvailability, TokenLists } from './health/ProvidersAndTokens'

const REFRESH_MS = 30000

export default function Health() {
  const fetcher = useCallback(() => adminService.getHealth(), [])
  const { data, loading, error, reload } = useLoad(fetcher, 'Could not run the health checks')

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') reload(true)
    }, REFRESH_MS)
    return () => window.clearInterval(id)
  }, [reload])

  const recheck = (
    <button type="button" onClick={() => reload(true)} disabled={loading} className="pill pill-dark h-10 disabled:opacity-50">
      {loading ? 'Checking...' : 'Re-check'}
    </button>
  )

  if (loading && !data) return <><PageTitle title="Health" right={recheck} /><Loading label="Running checks..." /></>
  if (!data) return <><PageTitle title="Health" right={recheck} /><EmptyState title="Health checks are not available" hint={error || 'The health endpoint did not answer.'} /></>

  const failing = data.services.filter(s => !s.ok).length
  const rpcOk = data.rpc.filter(r => r.configured && r.ok).length
  const rpcConfigured = data.rpc.filter(r => r.configured).length

  return (
    <div>
      <PageTitle
        title="Health"
        subtitle={`Checked ${fullDate(data.checked_at)}. Refreshes every 30 seconds while open.`}
        right={recheck}
      />

      <div className="flex flex-col gap-4">
        <Section title="Services" subtitle={failing === 0 ? 'Every dependency answered.' : `${failing} of ${data.services.length} checks failing.`}>
          <Services services={data.services} />
        </Section>

        <Section title="RPC endpoints" subtitle={`${rpcOk} of ${rpcConfigured} configured endpoints answering, ${fmtNum(data.rpc.length)} chains known.`}>
          <RpcTable rows={data.rpc} />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Providers" subtitle={`${data.providers.filter(p => p.available).length} of ${data.providers.length} can quote right now.`}>
            <ProviderAvailability providers={data.providers} />
          </Section>
          <Section title="Token lists" subtitle="Loaded from the providers' lists per chain.">
            <TokenLists lists={data.token_lists} />
          </Section>
        </div>
      </div>
    </div>
  )
}
