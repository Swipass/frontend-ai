// src/site/SiteNav.tsx
// The public site's top bar: wordmark, a floating pill of section links with
// the app launcher inside it, and a sign-in link. A sheet menu on mobile.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wordmark } from '../components/Logo'
import { ArrowUpRight } from './ui'

const SECTIONS: [string, string][] = [
  ['How it works', 'how-it-works'],
  ['Features', 'features'],
  ['Providers', 'providers'],
  ['Developers', 'developers'],
  ['FAQ', 'faq'],
]

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.75 14c.6-2.6 2.7-4 5.25-4s4.65 1.4 5.25 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function SiteNav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // On the landing page anchors scroll in place; elsewhere they lead home first.
  const anchor = (id: string) => (pathname === '/' ? `#${id}` : `/#${id}`)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/[0.06]' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-[color:var(--ink)]" aria-label="Swipass home">
            <Wordmark textClassName="text-[1.35rem]" />
          </Link>

          <nav
            aria-label="Main"
            className="hidden lg:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1.5 backdrop-blur-xl"
          >
            {SECTIONS.map(([label, id]) => (
              <a
                key={id}
                href={anchor(id)}
                className="rounded-full px-3.5 py-1.5 text-[0.84rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.06] hover:text-[color:var(--ink)]"
              >
                {label}
              </a>
            ))}
            <Link
              to="/docs"
              className="rounded-full px-3.5 py-1.5 text-[0.84rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.06] hover:text-[color:var(--ink)]"
            >
              Docs
            </Link>
            <Link
              to="/app"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] py-1.5 pl-3.5 pr-1.5 text-[0.84rem] text-[color:var(--ink)] transition-colors hover:bg-white/[0.14]"
            >
              Launch app
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--ink)] text-[#0a0a0a]">
                <ArrowUpRight size={12} />
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-2 px-2 text-[0.84rem] text-[color:var(--ink-2)] transition-colors hover:text-[color:var(--ink)]"
            >
              <UserIcon />
              Developer sign in
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[color:var(--ink)]"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 6h12M3 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-[opacity,visibility] duration-500 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl" onClick={() => setOpen(false)} />
        <div className="relative flex h-full flex-col px-6 pb-10 pt-5">
          <div className="flex items-center justify-between">
            <Wordmark textClassName="text-[1.35rem] text-[color:var(--ink)]" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink)]"
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-14 flex flex-col">
            {[...SECTIONS.map(([label, id]) => [label, anchor(id)] as const), ['Docs', '/docs'] as const].map(
              ([label, href], i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
                  className={`border-b border-white/[0.06] py-4 text-3xl font-light tracking-[-0.03em] text-[color:var(--ink)] transition-all duration-700 ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {label}
                </a>
              ),
            )}
          </nav>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <Link to="/auth" onClick={() => setOpen(false)} className="pill pill-dark">
              Sign in
            </Link>
            <Link to="/app" onClick={() => setOpen(false)} className="pill pill-light">
              Launch app <ArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
