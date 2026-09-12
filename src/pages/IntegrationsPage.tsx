// src/pages/IntegrationsPage.tsx
// Third-party integrations and the disclaimer that goes with them. Copy lives
// in src/content/integrations.ts, which the crawler snapshot reads too.
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DISCLAIMER, DISCLAIMER_UPDATED, INTEGRATION_GROUPS } from '../content/integrations'
import { useCursorHover } from '../site/hooks'
import { SiteFooter } from '../site/SiteFooter'
import { SiteNav } from '../site/SiteNav'
import { ArrowUpRight } from '../site/ui'
import '../site/landing/hero.css'

const cardClass =
  'rounded-2xl border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5'

export default function IntegrationsPage() {
  useCursorHover()
  const { hash } = useLocation()

  // A link to /integrations#disclaimer lands before this page has rendered, so
  // the browser cannot scroll to the section on its own.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="site min-h-screen bg-[#0a0a0a]">
      <SiteNav />
      <main className="px-2 pb-2 pt-[4.75rem] sm:px-4 lg:px-6">
        <section className="hero-frame relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] border border-white/[0.07] px-6 pb-14 pt-16 sm:rounded-[2.2rem] sm:px-10 lg:px-14">
          <div className="hero-blob hero-blob-a opacity-60" />
          <div className="relative max-w-2xl">
            <div className="kicker hero-in">Reference</div>
            <h1
              className="hero-in mt-4 text-[2.4rem] font-light leading-[1.05] tracking-[-0.045em] text-[color:var(--ink)] sm:text-[3.4rem]"
              style={{ ['--d' as string]: '100ms' }}
            >
              Third-party <span className="f-serif italic">integrations</span>
            </h1>
            <p
              className="hero-in mt-5 text-[1rem] leading-relaxed text-[color:var(--ink-3)]"
              style={{ ['--d' as string]: '200ms' }}
            >
              Swipass compares routes from the protocols and services below and hands you one transaction to sign
              from your own wallet. Here is who they are, what each one does, and the terms that apply when you use
              them.
            </p>
            <div className="hero-in mt-7 flex flex-wrap gap-3" style={{ ['--d' as string]: '300ms' }}>
              <a href="#disclaimer" className="pill pill-dark">
                Read the disclaimer
              </a>
              <Link to="/app" className="pill pill-light">
                Launch app <ArrowUpRight />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          {INTEGRATION_GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="border-b border-white/[0.07] py-12 sm:py-14">
              <div className="grid gap-8 lg:grid-cols-[1fr_2.4fr] lg:gap-14">
                <div>
                  <h2 className="text-[1.5rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{group.title}</h2>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">{group.summary}</p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li key={item.name} className={cardClass}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[1rem] text-[color:var(--ink)]">{item.name}</span>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${item.name} website`}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
                          >
                            <ArrowUpRight size={11} />
                          </a>
                        )}
                      </div>
                      <p className="mt-2 text-[0.84rem] leading-relaxed text-[color:var(--ink-3)]">{item.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}

          <section id="disclaimer" className="scroll-mt-24 py-14 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_2.4fr] lg:gap-14">
              <div>
                <div className="kicker">Disclaimer</div>
                <h2 className="mt-3 text-[1.5rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">
                  Using third-party integrations
                </h2>
                <p className="f-mono mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-[color:var(--ink-4)]">
                  Updated {DISCLAIMER_UPDATED}
                </p>
              </div>
              <ol className="flex flex-col gap-4">
                {DISCLAIMER.map((paragraph, i) => (
                  <li key={i} className="flex gap-4 text-[0.92rem] leading-relaxed text-[color:var(--ink-2)]">
                    <span className="f-mono mt-0.5 text-[0.72rem] text-[color:var(--ink-4)]">{String(i + 1).padStart(2, '0')}</span>
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
