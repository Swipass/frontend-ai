// src/pages/AdminDashboard/overview/Breakdowns.tsx
// Where the window's traffic went: providers, routes, tokens and projects.
import type { AdminDashboardData } from '../../../services/adminService'
import { Section, BreakdownBars, fmtNum, fmtUsd } from '../shared'
import { routeLabel } from '../format'

const sub = (intents: number) => `${fmtNum(intents)} intents`

export function Breakdowns({ data }: { data: AdminDashboardData }) {
  const money = (n: number) => fmtUsd(n, 0)
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      <Section title="Top providers" subtitle="By volume routed">
        <BreakdownBars rows={(data.top_providers || []).map(r => ({ label: r.provider, value: r.volume_usd, sub: sub(r.intents) }))} format={money} />
      </Section>
      <Section title="Top routes" subtitle="Chain pairs by volume">
        <BreakdownBars rows={(data.top_routes || []).map(r => ({ label: routeLabel(r.from_chain, r.to_chain), value: r.volume_usd, sub: sub(r.intents) }))} format={money} />
      </Section>
      <Section title="Top tokens" subtitle="Input tokens by volume">
        <BreakdownBars rows={(data.top_tokens || []).map(r => ({ label: r.token, value: r.volume_usd, sub: sub(r.intents) }))} format={money} />
      </Section>
      <Section title="Top projects" subtitle="Developer projects by volume">
        <BreakdownBars
          rows={(data.top_projects || []).map(r => ({ label: r.name, value: r.volume_usd, sub: `${sub(r.intents)}, ${fmtUsd(r.fees_usd)} fees` }))}
          format={money}
        />
      </Section>
    </div>
  )
}
