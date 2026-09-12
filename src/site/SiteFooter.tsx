// src/site/SiteFooter.tsx
import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'

type FooterLink = { label: string; href: string; soon?: boolean }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Launch app', href: '/app' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Providers', href: '/#providers' },
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

function FooterItem({ link }: { link: FooterLink }) {
  const base = 'text-[0.9rem] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]'
  if (link.soon) {
    return (
      <span className="text-[0.9rem] text-[color:var(--ink-4)]" title="Community server coming soon">
        {link.label} <span className="f-mono text-[0.65rem] uppercase tracking-[0.15em]">soon</span>
      </span>
    )
  }
  if (link.href.startsWith('http')) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={base}>
        {link.label}
      </a>
    )
  }
  if (link.href.includes('#')) {
    return (
      <a href={link.href} className={base}>
        {link.label}
      </a>
    )
  }
  return (
    <Link to={link.href} className={base}>
      {link.label}
    </Link>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] px-4 pb-10 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link to="/" className="text-[color:var(--ink)]" aria-label="Swipass home">
              <Wordmark textClassName="text-3xl" />
            </Link>
            <p className="mt-5 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">
              Cross-chain swaps, bridges and sends from one plain-language command. Non-custodial: you sign every
              transaction from your own wallet.
            </p>
            <div className="f-mono mt-6 text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--ink-4)]">
              Speak. Swipe. Settle.
            </div>
          </div>
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
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <span className="text-[0.8rem] text-[color:var(--ink-4)]">
            © {new Date().getFullYear()} Swipass. All rights reserved.
          </span>
          <a href="#top" className="f-mono text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--ink-4)] hover:text-[color:var(--ink)]">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
