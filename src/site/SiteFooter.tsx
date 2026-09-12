// src/site/SiteFooter.tsx
// A framed closing stage: brand and live API status, link columns, and the
// wordmark set large, fading into the floor.
import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'
import { useApiHealth } from './hooks'
import { ArrowUpRight } from './ui'
import './landing/hero.css'

type FooterLink = { label: string; href: string; soon?: boolean }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Launch app', href: '/app' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Providers', href: '/#providers' },
      { label: 'Security', href: '/#security' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Get an API key', href: '/auth' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com/Swipass' },
      { label: 'Discord', href: '', soon: true },
    ],
  },
]

const STATUS = {
  checking: { label: 'Checking API', dot: 'bg-white/40' },
  up: { label: 'API operational', dot: 'bg-[color:var(--ink)] shadow-[0_0_10px_rgba(255,255,255,0.8)]' },
  down: { label: 'API unreachable', dot: 'bg-white/25' },
}

const linkClass =
  'group inline-flex items-center gap-1.5 text-[0.95rem] text-[color:var(--ink-3)] transition-colors duration-300 hover:text-[color:var(--ink)]'

function FooterItem({ link }: { link: FooterLink }) {
  if (link.soon) {
    return (
      <span className="inline-flex items-center gap-2 text-[0.95rem] text-[color:var(--ink-4)]" title="Community server coming soon">
        {link.label}
        <span className="f-mono rounded-full border border-white/10 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em]">Soon</span>
      </span>
    )
  }
  const label = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
        {link.label}
      </span>
      {link.href.startsWith('http') && <ArrowUpRight size={11} />}
    </>
  )
  if (link.href.startsWith('http')) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {label}
      </a>
    )
  }
  if (link.href.includes('#')) {
    return (
      <a href={link.href} className={linkClass}>
        {label}
      </a>
    )
  }
  return (
    <Link to={link.href} className={linkClass}>
      {label}
    </Link>
  )
}

export function SiteFooter() {
  const status = STATUS[useApiHealth()]

  return (
    <footer className="px-2 pb-2 pt-6 sm:px-4 sm:pb-4 lg:px-6">
      <div className="hero-frame relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.6rem] border border-white/[0.07] sm:rounded-[2.2rem]">
        <div className="hero-blob hero-blob-b opacity-70" />

        <div className="relative grid gap-14 px-6 pb-10 pt-14 sm:px-10 sm:pt-16 lg:grid-cols-[1.3fr_2fr] lg:gap-20 lg:px-14">
          <div className="max-w-sm">
            <Link to="/" className="text-[color:var(--ink)]" aria-label="Swipass home">
              <Wordmark textClassName="text-[2rem]" />
            </Link>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[color:var(--ink-3)]">
              Cross-chain swaps, bridges and sends from one plain-language command. You sign every transaction from
              your own wallet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="chip f-mono text-[0.7rem]">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <Link to="/app" className="chip text-[0.78rem] transition-colors hover:border-white/20">
                Launch app <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <div className="kicker mb-5">{column.title}</div>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-6 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/[0.07] py-6 sm:mx-10 sm:flex-row sm:items-center lg:mx-14">
          <span className="text-[0.8rem] text-[color:var(--ink-4)]">© {new Date().getFullYear()} Swipass. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <span className="f-mono hidden text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--ink-4)] md:inline">Speak. Swipe. Settle.</span>
            <a
              href="#top"
              onClick={(event) => {
                event.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              aria-label="Back to top"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.12] text-[color:var(--ink)] transition-colors hover:bg-white/[0.08]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        <div
          className="pointer-events-none relative -mb-[4.5vw] flex select-none justify-center overflow-hidden text-white/[0.1]"
          style={{ maskImage: 'linear-gradient(to bottom, #000 25%, transparent 92%)' }}
          aria-hidden="true"
        >
          <Wordmark textClassName="text-[22vw] leading-[0.9] lg:text-[19rem]" />
        </div>
      </div>
    </footer>
  )
}
