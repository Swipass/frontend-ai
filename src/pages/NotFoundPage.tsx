// src/pages/NotFoundPage.tsx
// Unknown URLs get Vercel's 404.html with a real 404 status, and this is what
// that page (or any unknown client-side route) renders. It used to redirect to
// the landing page, which search engines read as a soft 404.
import { Link } from 'react-router-dom'
import { useCursorHover } from '../site/hooks'
import { SiteNav } from '../site/SiteNav'
import { ArrowUpRight } from '../site/ui'
import '../site/landing/hero.css'
import '../site/landing/features.css'

export default function NotFoundPage() {
  useCursorHover()
  return (
    <div className="site min-h-screen bg-[#0a0a0a]">
      <SiteNav />
      <main className="px-2 pb-4 pt-[4.75rem] sm:px-4 lg:px-6">
        <div className="hero-frame relative mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-[1440px] flex-col items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/[0.07] px-6 py-20 text-center sm:rounded-[2.2rem]">
          <div className="hero-blob hero-blob-a" />
          <div className="hero-blob hero-blob-b" />
          <span className="element-glyph hero-in relative select-none text-[9rem] font-light leading-none tracking-[-0.07em] sm:text-[14rem]" aria-hidden="true">
            404
          </span>
          <h1 className="hero-in relative mt-4 text-[2.4rem] font-light tracking-[-0.045em] text-[color:var(--ink)] sm:text-5xl" style={{ ['--d' as string]: '120ms' }}>
            Page not <span className="f-serif italic">found</span>
          </h1>
          <p className="hero-in relative mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[color:var(--ink-3)]" style={{ ['--d' as string]: '220ms' }}>
            The page you asked for does not exist or has moved.
          </p>
          <div className="hero-in relative mt-9 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '320ms' }}>
            <Link to="/app" className="pill pill-light">
              Launch app <ArrowUpRight />
            </Link>
            <Link to="/" className="pill pill-dark">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
