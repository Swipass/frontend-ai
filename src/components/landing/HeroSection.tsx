// src/components/landing/HeroSection.tsx
import { Link } from 'react-router-dom'
import { Fragment, useEffect, useRef } from 'react'

export function HeroSection() {
  const hlRef = useRef<HTMLDivElement>(null)

  // ── Subtle mouse parallax on the headline ──────────────────
  useEffect(() => {
    let mx = 0, my = 0, cx = 0, cy = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 10
      my = (e.clientY / window.innerHeight - 0.5) * 6
    }

    const tick = () => {
      cx += (mx - cx) * 0.06
      cy += (my - cy) * 0.06
      if (hlRef.current) {
        hlRef.current.style.transform =
          `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">

      <style>{`
        @keyframes heroUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawLine {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes drip {
          0%, 100% { transform: translateY(0);    opacity: 0.55; }
          60%      { transform: translateY(11px); opacity: 0.10; }
        }
        .ha { animation: heroUp 1.1s cubic-bezier(0.16,1,0.3,1) both; }
        .ha-1 { animation-delay: 0.08s; }
        .ha-2 { animation-delay: 0.22s; }
        .ha-3 { animation-delay: 0.42s; }
        .ha-4 { animation-delay: 0.56s; }
        .ha-5 { animation-delay: 0.72s; }
        .ha-6 { animation-delay: 0.88s; }
        .hero-main::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 0;
          height: 1px; width: 0;
          background: var(--gray-400);
          animation: drawLine 0.7s cubic-bezier(0.16,1,0.3,1) 1.15s forwards;
        }
        .scroll-pip::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 32%;
          background: var(--gray-600);
          animation: drip 2.2s ease-in-out 1.5s infinite;
        }
      `}</style>

      {/* ── Very subtle ambient glow — depth behind text ────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(255,255,255,0.025) 0%, transparent 100%)',
        }}
      />

      {/* ── Label ──────────────────────────────────────────── */}
      <span className="ha ha-1 section-label mb-10">
        Intent-Native DeFi Protocol
      </span>

      {/* ── Headline (parallax wrapper) ─────────────────────── */}
      <div ref={hlRef} style={{ willChange: 'transform' }}>
        {/*
          KEY CHANGE: "DeFi in plain" is now a small prefix — it reads
          like a label setting up the payoff. "language." is massive and
          owns the entire space. This size contrast is the main upgrade.
        */}
        <span
          className="ha ha-2 block font-display font-extrabold
                     text-2xl sm:text-3xl md:text-4xl
                     text-light-grey-1 leading-none tracking-tight"
        >
          DeFi in plain
        </span>
        <span
          className="ha ha-3 hero-main relative inline-block
                     font-serif italic font-normal
                     text-[4.2rem] sm:text-8xl md:text-9xl lg:text-[11rem]
                     text-almost-white leading-[0.88] tracking-tighter"
        >
          language.
        </span>
      </div>

      {/* ── Tagline — each word staggers in individually ────── */}
      <div className="flex items-center gap-4 sm:gap-5 mt-10 md:mt-11">
        {(['Speak.', 'Swipe.', 'Settle.'] as const).map((word, i) => (
          <Fragment key={word}>
            <span
              className={`ha ha-${i === 0 ? '3' : i === 1 ? '4' : '5'}
                          font-display font-bold
                          text-[0.6rem] sm:text-[0.65rem]
                          tracking-[0.38em] uppercase text-light-grey-1`}
            >
              {word}
            </span>
            {i < 2 && (
              <span
                className={`ha ha-${i === 0 ? '4' : '5'}
                            w-[2.5px] h-[2.5px] rounded-full bg-mid-grey flex-shrink-0`}
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* ── Sub-copy ───────────────────────────────────────── */}
      <p className="ha ha-5 mt-5 font-body text-[0.7rem] sm:text-xs
                    leading-[1.9] text-light-grey-1 max-w-[20rem]">
        Connect a wallet. Say what you need.<br />
        Swipass finds the optimal route and settles it.
      </p>

      {/* ── CTAs ───────────────────────────────────────────── */}
      <div className="ha ha-6 flex flex-col sm:flex-row gap-3 mt-9">
        <Link to="/app"  className="sw-btn sw-btn-primary">Launch App — Free</Link>
        <Link to="/docs" className="sw-btn sw-btn-ghost">Developer Docs</Link>
      </div>

      {/* ── Scroll cue ─────────────────────────────────────── */}
      <div className="ha ha-6 absolute bottom-8 left-1/2 -translate-x-1/2
                      flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-body text-[0.48rem] tracking-[0.32em] uppercase text-mid-grey">
          Scroll
        </span>
        <div className="scroll-pip relative w-px h-8
                        bg-gradient-to-b from-mid-grey to-transparent overflow-hidden" />
      </div>

    </section>
  )
}