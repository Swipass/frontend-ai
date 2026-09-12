// src/pages/DeveloperDashboard/components/Checklist.tsx
// Getting set up, step by step, each one pointing at the page that does it.
// Every tick comes from the API's own view of the account.
import { Link } from 'react-router-dom'
import type { OnboardingChecklist } from '../../../services/platformService'
import { Section } from '../shared'

const STEPS: { key: keyof OnboardingChecklist; label: string; hint: string; to: string }[] = [
  { key: 'has_project', label: 'Create a project', hint: 'Each project gets its own API key.', to: '/dashboard/developer/projects' },
  { key: 'first_request', label: 'Send your first request', hint: 'Call /v1/intent with the key. The quick start below has the shape.', to: '/docs' },
  { key: 'first_completed', label: 'Settle a transaction', hint: 'A user signs the returned transaction and it lands on chain.', to: '/dashboard/developer/requests' },
  { key: 'has_webhook', label: 'Add a webhook', hint: 'Get told when an intent is quoted, completes or fails.', to: '/dashboard/developer/webhooks' },
  { key: 'has_payout_wallet', label: 'Set a payout wallet', hint: 'Where your share of the fees is paid.', to: '/dashboard/developer/fee-share' },
]

export function Checklist({ checklist }: { checklist: OnboardingChecklist }) {
  const done = STEPS.filter(s => checklist[s.key]).length
  return (
    <Section title="Getting set up" subtitle={`${done} of ${STEPS.length} done`}>
      <ol className="flex flex-col">
        {STEPS.map((s, i) => {
          const ok = !!checklist[s.key]
          return (
            <li key={s.key} className="flex items-start gap-3 border-b border-white/[0.06] py-3 last:border-b-0">
              <span
                className={`f-mono mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.55rem] ${
                  ok ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[#0a0a0a]' : 'border-white/15 text-[color:var(--ink-4)]'
                }`}
                aria-hidden="true"
              >
                {ok ? (
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`text-[0.88rem] ${ok ? 'text-[color:var(--ink-3)] line-through decoration-white/20' : 'text-[color:var(--ink)]'}`}>{s.label}</div>
                {!ok && <p className="mt-0.5 text-[0.78rem] leading-relaxed text-[color:var(--ink-3)]">{s.hint}</p>}
              </div>
              {!ok && (
                <Link to={s.to} className="shrink-0 rounded-full border border-white/[0.1] px-3 py-1 text-[0.74rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.06] hover:text-[color:var(--ink)]">
                  Open
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
