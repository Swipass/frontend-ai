// src/pages/Auth/AuthLayout.tsx
// The stage every sign-in screen shares: site nav, the framed hero surface and
// one glass card with the mark, a kicker and a headline.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../../components/Logo'
import { useCursorHover } from '../../site/hooks'
import { SiteNav } from '../../site/SiteNav'
import '../../site/ui'
import '../../site/landing/hero.css'

export function AuthLayout({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
}) {
  useCursorHover()
  return (
    <div className="site min-h-screen bg-[#0a0a0a]">
      <SiteNav />
      <main className="px-2 pb-4 pt-[4.75rem] sm:px-4 lg:px-6">
        <div className="hero-frame relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-[1440px] items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/[0.07] px-4 py-14 sm:rounded-[2.2rem]">
          <div className="hero-blob hero-blob-a" />
          <div className="hero-blob hero-blob-b" />

          <div className="glass hero-in relative w-full max-w-[26rem] p-7 sm:p-9">
            <div className="text-center">
              <LogoMark size={40} className="mx-auto text-[color:var(--ink)] drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
              <div className="kicker mt-6">{kicker}</div>
              <h1 className="mt-3 text-[2rem] font-light leading-tight tracking-[-0.04em] text-[color:var(--ink)]">{title}</h1>
              {subtitle && <p className="mt-3 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">{subtitle}</p>}
            </div>
            <div className="mt-7">{children}</div>
            <div className="mt-7 flex items-center justify-center gap-5 border-t border-white/[0.08] pt-5 text-[0.84rem]">
              <Link to="/docs" className="text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]">
                Docs
              </Link>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <Link to="/" className="text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
