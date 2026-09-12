// src/site/landing/FinalCta.tsx
// The closing call to action: a smaller echo of the hero stage.
import { Link } from 'react-router-dom'
import { ArrowUpRight, Reveal } from '../ui'
import { OrbCanvas } from './OrbCanvas'
import './hero.css'

export function FinalCta() {
  return (
    <section className="px-2 pb-12 pt-24 sm:px-4 sm:pt-32 lg:px-6">
      <div className="hero-frame relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] border border-white/[0.07] px-6 py-24 text-center sm:rounded-[2.2rem] sm:py-32">
        <div className="hero-blob hero-blob-a opacity-70" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(90vw,620px)] -translate-x-1/2 -translate-y-1/2 opacity-45">
          <OrbCanvas />
        </div>
        <span
          className="pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[26vw] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] lg:text-[20rem]"
          aria-hidden="true"
        >
          Settle.
        </span>
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-[2.6rem] font-light leading-[1] tracking-[-0.045em] text-[color:var(--ink)] sm:text-6xl md:text-7xl">
              Ready to <span className="f-serif fade-word italic">move value?</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-[color:var(--ink-3)]">
              No account. No complexity. Connect your wallet and issue your first cross-chain command in under 30 seconds.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/app" className="pill pill-light">
              Launch app <ArrowUpRight />
            </Link>
            <Link to="/docs" className="pill pill-dark">
              Read the docs
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
