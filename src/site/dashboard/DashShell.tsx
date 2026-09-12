// src/site/dashboard/DashShell.tsx
// The signed-in shell shared by the developer and admin dashboards: the app's
// header language, a numbered glass sidebar with a progress rail, and a
// framed content stage. Each dashboard supplies its own nav and pages.
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wordmark } from '../../components/Logo'
import { useAuth } from '../../hooks/useAuth'
import { useCursorHover } from '../hooks'
import { ArrowUpRight } from '../ui'
import '../landing/hero.css'
import './dashboard.css'

export interface DashNavItem {
  label: string
  path: string
}

type Area = 'developer' | 'admin'

const AREAS: { key: Area; label: string; to: string }[] = [
  { key: 'developer', label: 'Developer', to: '/dashboard/developer' },
  { key: 'admin', label: 'Admin', to: '/dashboard/admin' },
]

function MenuIcon({ close = false }: { close?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={close ? 'M4 4l8 8M12 4l-8 8' : 'M3 5.5h10M3 10.5h10'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function DashShell({
  area,
  base,
  items,
  active,
  children,
}: {
  area: Area
  base: string
  items: DashNavItem[]
  active: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, isAdmin, logout } = useAuth()
  useCursorHover()

  useEffect(() => setOpen(false), [pathname])

  const index = Math.max(0, items.findIndex(item => item.path === active))
  const progress = (index + 1) / items.length
  const areas = AREAS.filter(a => a.key === 'developer' || isAdmin)
  const initial = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()

  return (
    <div className="site dash min-h-screen bg-[#070707]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-3 bg-[#070707]/90 px-3 backdrop-blur-md sm:px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[color:var(--ink)] lg:hidden"
          >
            <MenuIcon />
          </button>
          <Link to="/" aria-label="Swipass home" className="text-[color:var(--ink)]">
            <Wordmark textClassName="text-[1.25rem]" />
          </Link>
          {areas.length > 1 ? (
            <nav aria-label="Dashboard area" className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 sm:flex">
              {areas.map(a => (
                <Link
                  key={a.key}
                  to={a.to}
                  aria-current={a.key === area ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-[0.82rem] transition-colors duration-300 ${
                    a.key === area ? 'bg-white/[0.1] text-[color:var(--ink)]' : 'text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
                  }`}
                >
                  {a.label}
                </Link>
              ))}
            </nav>
          ) : (
            <span className="chip hidden text-[0.78rem] sm:inline-flex">Developer</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/docs" className="hidden rounded-full px-3 py-2 text-[0.84rem] text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)] md:inline-flex">
            Docs
          </Link>
          <Link to="/app" className="pill pill-dark hidden h-10 md:inline-flex">
            Launch app <ArrowUpRight />
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 sm:pr-3" title={user?.email}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f5f5f5,#8a8a8a_60%,#3a3a3a)] text-[0.75rem] font-medium text-[#0a0a0a]">
              {initial}
            </span>
            <span className="hidden max-w-[180px] truncate text-[0.8rem] text-[color:var(--ink-2)] sm:inline">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="hidden h-10 items-center rounded-full border border-white/[0.1] px-4 text-[0.82rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.06] hover:text-[color:var(--ink)] sm:inline-flex"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-2 px-2 pb-2 sm:px-3 sm:pb-3">
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <aside
          className={`dash-panel fixed inset-y-2 left-2 z-[70] flex w-[17rem] flex-col overflow-y-auto bg-[#0c0c0c] p-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:sticky lg:top-[4.5rem] lg:z-auto lg:h-[calc(100vh-5.25rem)] lg:w-60 lg:shrink-0 lg:translate-x-0 lg:bg-transparent ${
            open ? 'translate-x-0' : '-translate-x-[110%]'
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-2 pt-1 lg:hidden">
            <Wordmark textClassName="text-[1.1rem] text-[color:var(--ink)]" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink)]"
            >
              <MenuIcon close />
            </button>
          </div>

          <div className="kicker px-3 pb-3 pt-3">{area === 'admin' ? 'Operations' : 'Developer'}</div>
          <nav aria-label={`${area} sections`} className="relative">
            <span className="absolute bottom-3 left-[1.375rem] top-3 w-px bg-white/[0.08]" aria-hidden="true" />
            <span
              className="absolute left-[1.375rem] top-3 w-px bg-[color:var(--ink)] transition-[height] duration-700"
              style={{ height: `calc(${progress} * (100% - 1.5rem))` }}
              aria-hidden="true"
            />
            {items.map((item, i) => {
              const current = item.path === active
              return (
                <Link
                  key={item.label}
                  to={`${base}${item.path ? `/${item.path}` : ''}`}
                  aria-current={current ? 'page' : undefined}
                  className={`relative flex items-center gap-3 rounded-full py-2 pl-3 pr-3 text-[0.88rem] transition-all duration-300 ${
                    current
                      ? 'bg-white/[0.07] text-[color:var(--ink)]'
                      : 'text-[color:var(--ink-3)] hover:bg-white/[0.04] hover:text-[color:var(--ink)]'
                  }`}
                >
                  <span
                    className={`f-mono relative grid h-5 w-5 shrink-0 place-items-center rounded-full border bg-[#0a0a0a] text-[0.55rem] transition-colors duration-500 ${
                      i <= index ? 'border-[color:var(--ink)] text-[color:var(--ink)]' : 'border-white/15 text-[color:var(--ink-4)]'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t border-white/[0.06] pt-4 lg:hidden">
            {areas.length > 1 &&
              areas
                .filter(a => a.key !== area)
                .map(a => (
                  <Link key={a.key} to={a.to} className="rounded-full px-3 py-2 text-[0.88rem] text-[color:var(--ink-2)]">
                    {a.label} dashboard
                  </Link>
                ))}
            <Link to="/app" className="rounded-full px-3 py-2 text-[0.88rem] text-[color:var(--ink-2)]">
              Launch app
            </Link>
            <Link to="/docs" className="rounded-full px-3 py-2 text-[0.88rem] text-[color:var(--ink-2)]">
              Docs
            </Link>
            <button type="button" onClick={logout} className="rounded-full px-3 py-2 text-left text-[0.88rem] text-[color:var(--ink-2)]">
              Log out
            </button>
          </div>
        </aside>

        <main className="hero-frame relative min-h-[calc(100vh-4.75rem)] min-w-0 flex-1 overflow-hidden rounded-[20px] border border-white/[0.07]">
          <div className="hero-blob hero-blob-a opacity-40" />
          <div key={pathname} className="dash-rise relative mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
