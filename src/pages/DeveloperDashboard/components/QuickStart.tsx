// src/pages/DeveloperDashboard/components/QuickStart.tsx
// The one request that matters, ready to paste. Uses a real key prefix from
// one of the developer's projects when there is one; never a made-up key.
import { config } from '../../../config'
import { Section, CopyButton } from '../shared'

function apiBase(): string {
  return config.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '')
}

export function QuickStart({ keyPrefix }: { keyPrefix?: string | null }) {
  const base = apiBase()
  const keySample = keyPrefix ? `${keyPrefix.replace(/\.+$/, '')}...` : 'YOUR_API_KEY'
  const curl = `curl -X POST ${base}/v1/intent \\
  -H "X-API-Key: ${keySample}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Bridge 1 ETH to Polygon",
    "destination_address": "0x..."
  }'`

  return (
    <Section title="Quick start" subtitle="One POST returns the best route and a transaction for your user to sign." right={<CopyButton text={curl} label="Copy curl" />}>
      {!keyPrefix && <p className="mb-3 text-[0.8rem] text-[color:var(--ink-3)]">Create a project to get a live API key, then drop it into the request below.</p>}
      <pre className="f-mono overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-[0.74rem] leading-relaxed text-[color:var(--ink-2)]">{curl}</pre>
      <div className="mt-3 text-[0.76rem] text-[color:var(--ink-4)]">
        Base URL: <code className="f-mono text-[color:var(--ink-3)]">{base}</code>
      </div>
    </Section>
  )
}
