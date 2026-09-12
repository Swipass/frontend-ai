// src/site/landing/Hero.tsx
// The framed hero stage: drifting light, falling streaks, chain nodes on rails,
// and the orb with its token orbit above the headline.
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../../components/Logo'
import type { ChainInfo } from '../../services/intentService'
import { usePrefersReducedMotion } from '../hooks'
import { ArrowRight, ArrowUpRight } from '../ui'
import { ChainNodes } from './ChainNodes'
import { OrbCanvas } from './OrbCanvas'
import { TokenOrbit } from './TokenOrbit'
import './hero.css'

const WORDS = ['Speak.', 'Swipe.', 'Settle.']
const CYCLE_MS = 2600

// Kept low so they fall behind the buttons, never through the copy.
const STREAKS = [
  { left: '43%', height: '13%', dur: '5.2s', delay: '0s' },
  { left: '46.5%', height: '20%', dur: '3.9s', delay: '1.2s' },
  { left: '50%', height: '16%', dur: '4.7s', delay: '2.2s' },
  { left: '53.5%', height: '22%', dur: '6.1s', delay: '0.6s' },
  { left: '57%', height: '12%', dur: '4.3s', delay: '2.9s' },
]

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

function WordCycle() {
  const [index, setIndex] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), CYCLE_MS)
    return () => clearInterval(timer)
  }, [reduced])

  return (
    <div className="w-44" aria-hidden="true">
      <div key={index} className="word-swap text-[0.95rem] text-[color:var(--ink)]">
        {WORDS[index]}
      </div>
      <div className="cycle-bar mt-3" style={{ '--cycle': `${CYCLE_MS}ms` } as CSSProperties}>
        {WORDS.map((word, i) => (
          <i key={`${word}-${index}`} className={i < index ? 'done' : i === index ? 'on' : ''} />
        ))}
      </div>
    </div>
  )
}

export function Hero({ chains }: { chains: ChainInfo[] }) {
  return (
    <section id="top" className="relative px-2 pt-[4.75rem] sm:px-4 lg:px-6">
      <div className="hero-frame relative mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-[1440px] flex-col overflow-hidden rounded-[1.6rem] border border-white/[0.07] sm:rounded-[2.2rem]">
        <div className="hero-blob hero-blob-a" />
        <div className="hero-blob hero-blob-b" />
        {STREAKS.map((streak) => (
          <span
            key={streak.left}
            className="streak hidden sm:block"
            style={{ left: streak.left, height: streak.height, '--dur': streak.dur, '--delay': streak.delay } as CSSProperties}
          />
        ))}
        <ChainNodes chains={chains} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-20 pt-14 text-center sm:pb-24 sm:pt-16">
          <div className="hero-in relative aspect-square w-[min(74vw,34svh,420px)]" style={delay(0)}>
            <div className="orb-glow" />
            <div className="orb-shell" />
            <OrbCanvas />
            <TokenOrbit />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <LogoMark size={76} className="text-[color:var(--ink)] drop-shadow-[0_0_26px_rgba(255,255,255,0.55)]" />
              <span className="mt-1 text-[0.7rem] font-medium tracking-[0.38em] text-[color:var(--ink-2)]">SWIPASS</span>
            </div>
          </div>

          <Link to="/app" className="chip hero-in -mt-2" style={delay(150)}>
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ink)] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            No account. Just a wallet.
            <ArrowRight size={12} />
          </Link>

          <h1
            className="hero-in mt-5 text-[clamp(2.6rem,min(6.4vw,9svh),5.6rem)] font-light leading-[0.95] tracking-[-0.05em] text-[color:var(--ink)]"
            style={delay(260)}
          >
            DeFi in plain <span className="f-serif fade-word pr-[0.08em] text-[1.08em] italic">language.</span>
          </h1>

          <p className="hero-in mt-5 max-w-xl text-[0.95rem] leading-relaxed text-[color:var(--ink-3)]" style={delay(380)}>
            Connect a wallet and say what you need. Swipass compares every route across providers and hands you one
            transaction to sign.
          </p>

          <div className="hero-in mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={delay(500)}>
            <Link to="/app" className="pill pill-dark">
              Launch app <ArrowUpRight />
            </Link>
            <a href="#how-it-works" className="pill pill-light">
              See how it works
            </a>
          </div>
        </div>

        <a href="#how-it-works" className="chip absolute bottom-5 left-5 z-10 sm:bottom-7 sm:left-7">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--ink)] text-[#0a0a0a]">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="f-mono text-[0.7rem]">Scroll to explore</span>
        </a>
        <div className="absolute bottom-7 right-7 z-10 hidden sm:block">
          <WordCycle />
        </div>
      </div>
    </section>
  )
}
