// src/site/landing/ConvergeSection.tsx
// The provider network: lines converge on a card describing one provider, and
// pills below switch between them. Rotates on its own until touched.
import { useEffect, useRef, useState } from 'react'
import { PROVIDER_PROFILES, profileFor, type ProviderProfile } from '../../content/providers'
import type { ProviderInfo } from '../../services/intentService'
import { usePrefersReducedMotion } from '../hooks'
import { SectionIntro } from '../ui'
import { ConvergeCanvas } from './ConvergeCanvas'

const ROTATE_MS = 4500

interface Entry {
  profile: ProviderProfile
  chains: number | null
}

function entriesFrom(providers: ProviderInfo[]): Entry[] {
  if (!providers.length) return PROVIDER_PROFILES.map((profile) => ({ profile, chains: null }))
  return providers.map((p) => ({ profile: profileFor(p.name, p.display_name), chains: p.supported_chains.length }))
}

export function ConvergeSection({ providers }: { providers: ProviderInfo[] }) {
  const cardRef = useRef<HTMLElement>(null)
  const entries = entriesFrom(providers)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const current = entries[index % entries.length]

  useEffect(() => {
    if (paused || reduced) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % entries.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [paused, reduced, entries.length])

  const stats = [
    { label: 'Chains', value: current.chains ?? 'Live' },
    { label: 'Scoring', value: '70 / 20 / 10' },
    { label: 'Failover', value: 'Auto' },
  ]

  return (
    <section id="providers" className="px-2 sm:px-4 lg:px-6">
      <div className="paper relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] pb-20 sm:rounded-[2.2rem] sm:pb-28">
        <div className="relative flex min-h-[600px] flex-col items-center justify-center px-5 py-16 sm:min-h-[660px]">
          <ConvergeCanvas targetRef={cardRef} />

          <article
            ref={cardRef}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            className="relative w-[min(86vw,410px)] overflow-hidden rounded-2xl border border-[color:var(--line-2)] bg-[#f3f3f3] shadow-[0_24px_60px_-28px_rgba(10,10,10,0.45)]"
          >
            <div key={current.profile.name} className="word-swap relative">
              <div className="flex items-center gap-3 border-b border-[color:var(--line)] bg-[#e4e4e4] px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0a0a0a] text-[0.95rem] font-semibold text-[#f5f5f5]">
                  {current.profile.displayName.charAt(0)}
                </span>
                <div>
                  <div className="f-serif text-[1.35rem] leading-none text-[color:var(--ink)]">{current.profile.displayName}</div>
                  <div className="f-mono mt-1 text-[0.7rem] text-[color:var(--ink-3)]">{current.profile.kind}</div>
                </div>
              </div>
              <div className="px-5 pb-5 pt-4">
                <div className="flex gap-2">
                  {['Live quotes', 'Non-custodial'].map((tag) => (
                    <span key={tag} className="f-mono rounded-md bg-[#e1e1e1] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.08em] text-[color:var(--ink-2)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="f-mono mt-4 min-h-[4.5rem] text-[0.76rem] leading-relaxed text-[color:var(--ink-3)]">{current.profile.summary}</p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="f-mono text-[0.65rem] text-[color:var(--ink-4)]">{stat.label}</div>
                      <div className="f-serif mt-1 text-[1.25rem] text-[color:var(--ink)]">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <div className="relative mt-8 flex max-w-full gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Providers">
            {entries.map((entry, i) => {
              const selected = i === index % entries.length
              return (
                <button
                  key={entry.profile.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setIndex(i)
                    setPaused(true)
                  }}
                  className={`f-mono shrink-0 rounded-full border px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.1em] transition-all duration-300 ${
                    selected
                      ? 'border-[#0a0a0a] bg-[#0a0a0a] text-[#f5f5f5]'
                      : 'border-[color:var(--line-2)] bg-[#eeeeee]/80 text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
                  }`}
                >
                  {entry.profile.displayName}
                </button>
              )
            })}
          </div>
        </div>

        <SectionIntro
          align="center"
          className="px-5"
          kicker="Provider network"
          title={<span className="f-serif">Every route converges on one best price</span>}
          body="Swipass queries every integrated provider at once. A weighted score on output, speed and 30-day success rate picks the winner, with automatic failover if a route expires mid-flight."
        />
      </div>
    </section>
  )
}
