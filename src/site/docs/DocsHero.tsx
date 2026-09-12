// src/site/docs/DocsHero.tsx
// The docs front door: a framed stage with the orb, the page title, the API's
// basics, and element cards that jump straight to the most used sections.
import type { CSSProperties } from 'react'
import { LogoMark } from '../../components/Logo'
import { OrbCanvas } from '../landing/OrbCanvas'
import { ArrowUpRight, PillLink } from '../ui'
import '../landing/hero.css'
import '../landing/features.css'

const JUMPS = [
  { id: 'quick-start', symbol: 'Qs', label: 'Quick start', text: 'Your first intent, in five languages.' },
  { id: 'endpoints', symbol: 'Ep', label: 'Endpoints', text: 'The complete public API surface.' },
  { id: 'sdks', symbol: 'Sd', label: 'SDKs', text: 'Typed clients for JavaScript and Python.' },
  { id: 'webhooks', symbol: 'Wh', label: 'Webhooks', text: 'Signed lifecycle events, no polling.' },
]

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function DocsHero({ apiBase, onJump }: { apiBase: string; onJump: (id: string) => void }) {
  return (
    <section className="px-2 pt-[4.75rem] sm:px-4 lg:px-6">
      <div className="hero-frame relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] border border-white/[0.07] sm:rounded-[2.2rem]">
        <div className="hero-blob hero-blob-a" />
        <div className="blueprint blueprint-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-5%] top-[42%] hidden aspect-square w-[500px] -translate-y-1/2 lg:block" aria-hidden="true">
          <div className="orb-glow" />
          <div className="orb-shell" />
          <OrbCanvas />
          <div className="absolute inset-0 grid place-items-center">
            <LogoMark size={64} className="text-[color:var(--ink)] drop-shadow-[0_0_22px_rgba(255,255,255,0.5)]" />
          </div>
        </div>

        <div className="relative px-6 pb-8 pt-14 sm:px-10 sm:pt-20 lg:px-14">
          <div className="max-w-2xl">
            <div className="kicker hero-in" style={delay(0)}>
              Documentation · API v1
            </div>
            <h1
              className="hero-in mt-5 text-[clamp(2.6rem,6vw,5rem)] font-light leading-[0.98] tracking-[-0.05em] text-[color:var(--ink)]"
              style={delay(100)}
            >
              Swipass API <span className="f-serif fade-word block pb-1 text-[0.8em] italic tracking-[-0.02em]">Developer Documentation</span>
            </h1>
            <p className="hero-in mt-6 max-w-lg text-[0.98rem] leading-relaxed text-[color:var(--ink-3)]" style={delay(200)}>
              One endpoint turns a plain-language command into scored, pre-flight simulated quotes and calldata your
              users sign. Non-custodial by design.
            </p>
            <div className="hero-in mt-7 flex flex-wrap gap-2" style={delay(280)}>
              {[
                ['Base URL', apiBase || 'your-swipass-host'],
                ['Format', 'application/json'],
                ['Custody', 'non-custodial'],
              ].map(([label, value]) => (
                <span key={label} className="chip f-mono text-[0.72rem]">
                  <span className="text-[color:var(--ink-4)]">{label}</span> {value}
                </span>
              ))}
            </div>
            <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row" style={delay(360)}>
              <PillLink to="/auth" arrow>
                Get an API key
              </PillLink>
              <button type="button" onClick={() => onJump('quick-start')} className="pill pill-dark">
                Jump to quick start
              </button>
            </div>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {JUMPS.map((jump, i) => (
              <button
                key={jump.id}
                type="button"
                onClick={() => onJump(jump.id)}
                className="glass hero-in group p-5 text-left transition-colors duration-500 hover:border-white/[0.18]"
                style={delay(440 + i * 70)}
              >
                <div className="flex items-center justify-between">
                  <span className="element-glyph text-[2.2rem] font-light leading-none tracking-[-0.05em]">{jump.symbol}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-[color:var(--ink-2)] transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight size={12} />
                  </span>
                </div>
                <div className="mt-5 text-[0.98rem] text-[color:var(--ink)]">{jump.label}</div>
                <div className="mt-1 text-[0.82rem] text-[color:var(--ink-3)]">{jump.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
