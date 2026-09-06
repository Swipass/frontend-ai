// src/pages/DeveloperDashboard/index.tsx
// Developer dashboard shell: header, collapsible nav and routing. Identity comes
// from useAuth. Each panel lives in its own file.
import { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Wordmark } from '../../components/Logo'
import Overview from './Overview'
import Projects from './Projects'
import ApiKeys from './ApiKeys'
import Usage from './Usage'
import Payouts from './Payouts'
import FeeShare from './FeeShare'
import Webhooks from './Webhooks'
import Settings from './Settings'

const NAV_ITEMS = [
  { label: 'Overview', path: '' },
  { label: 'Projects', path: 'projects' },
  { label: 'API Keys', path: 'keys' },
  { label: 'Usage & Analytics', path: 'usage' },
  { label: 'Payouts', path: 'payouts' },
  { label: 'Fee-share', path: 'fee-share' },
  { label: 'Webhooks', path: 'webhooks' },
  { label: 'Settings', path: 'settings' },
]

function DashLayout({ children, active }: { children: React.ReactNode; active: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen bg-deepest-dark font-mono flex flex-col">
      <header className="bg-dark-grey-1 border-b border-dark-grey-3 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-almost-white tracking-tighter"><Wordmark textClassName="text-lg" /></Link>
          <span className="text-xs uppercase tracking-wider text-light-grey-1 px-2 py-1 border border-dark-grey-3 rounded">Developer</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link to="/app" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">App</Link>
            <Link to="/docs" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Docs</Link>
            {user?.email && <span className="text-xs text-light-grey-1 max-w-[160px] truncate">{user.email}</span>}
            <button onClick={logout} className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Log out</button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-almost-white w-8 h-8 flex items-center justify-center border border-dark-grey-3 rounded"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-deepest-dark/70 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-dark-grey-1 border-r border-dark-grey-3 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:block
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-dark-grey-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-light-grey-1">Navigation</div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-light-grey-1" aria-label="Close navigation">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="py-4">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.label}
                to={`/dashboard/developer${item.path ? '/' + item.path : ''}`}
                className={`block px-6 py-3 text-sm transition-all duration-200 ${
                  active === item.path
                    ? 'text-almost-white bg-dark-grey-2 border-l-2 border-light-grey-3'
                    : 'text-light-grey-1 hover:text-light-grey-3 hover:bg-dark-grey-2'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="mt-6 pt-4 border-t border-dark-grey-3 px-6">
                <Link to="/dashboard/admin" className="block text-sm text-light-grey-1 hover:text-light-grey-3 transition-colors">
                  Admin Panel
                </Link>
              </div>
            )}
            <div className="mt-4 px-6 md:hidden">
              <button onClick={logout} className="text-sm text-light-grey-1 hover:text-light-grey-3">Log out</button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function DeveloperDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashLayout active=""><Overview /></DashLayout>} />
      <Route path="projects" element={<DashLayout active="projects"><Projects /></DashLayout>} />
      <Route path="keys" element={<DashLayout active="keys"><ApiKeys /></DashLayout>} />
      <Route path="usage" element={<DashLayout active="usage"><Usage /></DashLayout>} />
      <Route path="payouts" element={<DashLayout active="payouts"><Payouts /></DashLayout>} />
      <Route path="fee-share" element={<DashLayout active="fee-share"><FeeShare /></DashLayout>} />
      <Route path="webhooks" element={<DashLayout active="webhooks"><Webhooks /></DashLayout>} />
      <Route path="settings" element={<DashLayout active="settings"><Settings /></DashLayout>} />
      <Route path="*" element={<Navigate to="/dashboard/developer" replace />} />
    </Routes>
  )
}
