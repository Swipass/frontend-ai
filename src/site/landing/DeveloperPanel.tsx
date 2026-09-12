// src/site/landing/DeveloperPanel.tsx
// The developer offer as a product panel: what the API is, the live rates for
// direct and integrated traffic, and three reasons to build on it.
import { useState, type ReactNode } from 'react'
import { useFeeRates } from '../../hooks/useFeeRates'
import { PillLink, Reveal, SectionIntro } from '../ui'

type Audience = 'direct' | 'developer'

function IconTile({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#0a0a0a]/25 bg-gradient-to-b from-[#f2f2f2] to-[#a9a9a9] shadow-[inset_0_1px_0_#fff,0_4px_0_#8a8a8a,0_14px_24px_-12px_rgba(10,10,10,0.5)]">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </div>
  )
}

const CARDS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'One endpoint',
    text: 'POST /v1/intent takes a sentence and returns scored quotes with ready-to-sign calldata. JavaScript and Python SDKs included.',
    icon: (
      <>
        <rect x="4" y="6" width="22" height="18" rx="3" />
        <path d="m9 12 3 3-3 3M15 18h6" />
      </>
    ),
  },
  {
    title: 'Bring your own LLM',
    text: 'Pass X-LLM-Provider, X-LLM-API-Key and X-LLM-Model per request. Keys are used for that request only and never stored.',
    icon: (
      <>
        <rect x="8" y="8" width="14" height="14" rx="2" />
        <path d="M12 4v4M18 4v4M12 22v4M18 22v4M4 12h4M4 18h4M22 12h4M22 18h4" />
      </>
    ),
  },
  {
    title: 'Paid on every swap',
    text: 'Each transaction your users execute accrues to your project balance, withdrawable to any EVM wallet once it reaches $50.',
    icon: (
      <>
        <ellipse cx="15" cy="8" rx="9" ry="3.5" />
        <path d="M6 8v5c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V8M6 13v5c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-5" />
      </>
    ),
  },
]

export function DeveloperPanel({ chainCount }: { chainCount: number | null }) {
  const fees = useFeeRates()
  const [audience, setAudience] = useState<Audience>('developer')
  // Rates come from the API; until they do, say so rather than print a number.
  const rate = (value: string) => value || (fees.loaded ? 'See docs' : '...')

  const tiles =
    audience === 'direct'
      ? [
          { label: 'Fee', value: rate(fees.direct) },
          { label: 'Account', value: 'None' },
          { label: 'Chains', value: chainCount ? String(chainCount) : 'EVM' },
        ]
      : [
          { label: 'Fee', value: rate(fees.developer) },
          { label: 'Your cut', value: rate(fees.developerCut) },
          { label: 'Revenue share', value: rate(fees.revenueShare) },
        ]

  return (
    <section id="developers" className="px-2 pt-2 sm:px-4 lg:px-6">
      <div className="paper mx-auto max-w-[1440px] rounded-[1.6rem] px-4 py-20 sm:rounded-[2.2rem] sm:px-8 sm:py-28 lg:px-12">
        <SectionIntro
          kicker="Developer platform"
          title={
            <span className="f-serif">
              Build with intent. <span className="italic text-[color:var(--ink-3)]">Earn on every swap.</span>
            </span>
          }
        />

        <Reveal delay={120} className="mt-12">
          <div className="grid gap-10 rounded-[1.75rem] border border-[color:var(--line-2)] bg-[#dcdcdc]/70 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <h3 className="f-serif text-[1.9rem] leading-tight text-[color:var(--ink)] sm:text-[2.3rem]">
                The Swipass API, one endpoint for every chain
              </h3>
              <p className="f-mono mt-5 max-w-md text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">
                Embed plain-language swaps, bridges and sends in your own product. Swipass parses the command, sources
                quotes from every connected provider and returns calldata your users sign.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillLink to="/docs" variant="outline">Read the docs</PillLink>
                <PillLink to="/auth" variant="outline">Get an API key</PillLink>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex self-start rounded-full border border-[color:var(--line-2)] bg-[#e9e9e9] p-1 lg:self-end" role="tablist" aria-label="Pricing for">
                {(
                  [
                    ['direct', 'Direct users'],
                    ['developer', 'Via your app'],
                  ] as [Audience, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={audience === key}
                    onClick={() => setAudience(key)}
                    className={`rounded-full px-4 py-1.5 text-[0.8rem] transition-all duration-300 ${
                      audience === key ? 'bg-[#0a0a0a] text-[#f5f5f5]' : 'text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div key={audience} className="word-swap grid flex-1 grid-cols-3 gap-2">
                {tiles.map((tile) => (
                  <div key={tile.label} className="flex flex-col items-center justify-center rounded-2xl bg-[#cfcfcf]/70 px-2 py-8 text-center">
                    <div className="f-mono text-[0.68rem] text-[color:var(--ink-3)]">{tile.label}</div>
                    <div className="f-serif mt-3 text-[1.6rem] leading-none text-[color:var(--ink)] sm:text-[2rem]">{tile.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={180 + i * 90}>
              <div className="h-full rounded-[1.75rem] border border-[color:var(--line-2)] bg-[#dcdcdc]/70 p-7 transition-colors duration-500 hover:bg-[#d4d4d4]">
                <IconTile>{card.icon}</IconTile>
                <h4 className="f-serif mt-10 text-[1.4rem] text-[color:var(--ink)]">{card.title}</h4>
                <p className="f-mono mt-3 text-[0.78rem] leading-relaxed text-[color:var(--ink-3)]">{card.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
