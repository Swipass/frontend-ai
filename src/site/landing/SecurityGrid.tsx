// src/site/landing/SecurityGrid.tsx
import type { PointerEvent, ReactNode } from 'react'
import { Reveal, SectionIntro } from '../ui'

const ITEMS: { title: string; desc: string; icon: ReactNode }[] = [
  { title: 'Global Circuit Breaker', desc: 'Super Admin can pause the entire intent system instantly. Every request then receives a 503.', icon: <path d="M12 4v8M7.5 7a7 7 0 1 0 9 0" /> },
  { title: 'Privacy-First Voice', desc: 'Vosk runs as WebAssembly. Transcription is entirely local. Only text commands are transmitted.', icon: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></> },
  { title: 'API Key Hashing', desc: 'All developer keys are bcrypt-hashed before storage. Plain-text shown once at creation.', icon: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l2 2M14 9l2 2" /></> },
  { title: 'Rate Limiting', desc: 'Redis-backed: 60 req/min per API key, 20 req/min per IP. Abuse auto-detected.', icon: <><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 18 4-5" /></> },
  { title: 'Tx Simulation', desc: 'Optional pre-flight simulation catches reverts before signing. Prevents failed transactions.', icon: <><path d="M4 12h3l2-5 4 10 2-5h5" /></> },
  { title: 'Role-Based Access', desc: 'Support, Finance, Moderator staff roles with granular permissions set by Super Admin.', icon: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.5M18 14.8c1.4.7 2.3 2.1 2.6 4.2" /></> },
]

function spotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

export function SecurityGrid() {
  return (
    <section id="security" className="mx-auto max-w-[1440px] px-6 pt-24 sm:pt-32 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            kicker="Security and control"
            title={
              <>
                Enterprise-grade <span className="f-serif italic">failsafes</span>
              </>
            }
            body="Every layer is built on non-custodial principles. Your keys never leave your wallet, and admin controls keep the platform running safely."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 90}>
              <article
                onPointerMove={spotlight}
                className="element-card glass relative group h-full overflow-hidden p-7 transition-colors duration-500 hover:border-white/[0.16]"
              >
                <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[color:var(--ink)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="relative mt-8 text-[1.1rem] tracking-[-0.01em] text-[color:var(--ink)]">{item.title}</h3>
                <p className="relative mt-2 text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
