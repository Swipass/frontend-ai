// src/site/landing/ElementCards.tsx
// Capabilities as "elements": a snap carousel of frosted cards, each with a
// large glowing symbol, over a blueprint grid.
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { FEATURES } from '../../content/features'
import { Reveal, SectionIntro } from '../ui'
import './features.css'

function Chevrons() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <path d="M2 1.5 6.5 6 2 10.5M9 1.5 13.5 6 9 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5c.5 3.3 1.7 4.5 5 5-3.3.5-4.5 1.7-5 5-.5-3.3-1.7-4.5-5-5 3.3-.5 4.5-1.7 5-5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

export function ElementCards() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        })
      },
      { root: trackRef.current, threshold: 0.6 },
    )
    cardRefs.current.forEach((card) => card && observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const go = (index: number) => {
    const target = Math.max(0, Math.min(FEATURES.length - 1, index))
    cardRefs.current[target]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      <div className="blueprint blueprint-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionIntro
            kicker="Core capabilities"
            title={
              <>
                Everything needed to <span className="f-serif italic">move value</span>
              </>
            }
            body="Swipass abstracts bridge interfaces, token selection and chain switching. From wallet connect, every operation reduces to a single sentence."
          />
          <Reveal delay={200} className="flex items-center gap-4">
            <span className="f-mono text-[0.75rem] text-[color:var(--ink-3)]">
              {String(active + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
            </span>
            {[
              { label: 'Previous capability', step: -1, path: 'M10 3 5 8l5 5' },
              { label: 'Next capability', step: 1, path: 'M6 3l5 5-5 5' },
            ].map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={() => go(active + button.step)}
                aria-label={button.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-[color:var(--ink)] transition-colors hover:bg-white/[0.1]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d={button.path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </Reveal>
        </div>
      </div>

      <Reveal delay={120}>
        <div
          ref={trackRef}
          className="element-track relative mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          style={{ paddingInline: 'max(1.25rem, calc((100% - min(88vw, 780px)) / 2))' }}
        >
          {FEATURES.map((feature, i) => (
            <article
              key={feature.symbol}
              ref={(el) => (cardRefs.current[i] = el)}
              data-index={i}
              data-active={i === active}
              onPointerMove={trackSpotlight}
              className="element-card glass relative w-[min(88vw,780px)] shrink-0 snap-center overflow-hidden p-6 sm:p-9"
            >
              <svg className="pointer-events-none absolute right-[30%] top-0 hidden h-24 w-72 sm:block" viewBox="0 0 280 90" fill="none" aria-hidden="true">
                <path d="M280 0 200 70H0" stroke="rgba(255,255,255,0.08)" />
              </svg>
              <div className="relative flex items-start justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04]">
                  <span className="element-glyph text-[1.35rem] font-light tracking-[-0.04em]">{feature.symbol}</span>
                </div>
                <span className="chip text-[0.78rem]">
                  <Sparkle /> {feature.audience}
                </span>
              </div>
              <div className="relative mt-8 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
                <div className="max-w-sm">
                  <h3 className="text-[2.1rem] font-light tracking-[-0.04em] text-[color:var(--ink)]">
                    {feature.symbol}
                    <sup className="ml-1.5 text-[0.95rem] font-normal tracking-normal text-[color:var(--ink-2)]">[{feature.name}]</sup>
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-[color:var(--ink-2)]">{feature.title}</p>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">{feature.desc}</p>
                  <Link to={feature.href} className="pill pill-dark mt-7 h-12 rounded-2xl px-6 uppercase tracking-[0.02em]">
                    Learn more <Chevrons />
                  </Link>
                </div>
                <span
                  className="element-glyph order-first select-none pr-3 text-[6.5rem] font-light leading-[0.85] tracking-[-0.06em] sm:order-none sm:text-[9.5rem]"
                  aria-hidden="true"
                >
                  {feature.symbol}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Capabilities">
        {FEATURES.map((feature, i) => (
          <button
            key={feature.symbol}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={feature.title}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-[color:var(--ink)]' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>
    </section>
  )
}
