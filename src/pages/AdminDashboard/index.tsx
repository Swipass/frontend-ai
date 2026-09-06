// src/pages/AdminDashboard/index.tsx
// Admin dashboard shell: header, collapsible nav and routing. The route is
// already guarded (admin only) in App.tsx. Each panel lives in its own file.
import { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Wordmark } from '../../components/Logo'
import Overview from './Overview'
import Transactions from './Transactions'
import Providers from './Providers'
import Users from './Users'
import AdminProjects from './Projects'
import ControlPlane from './ControlPlane'
import Analytics from './Analytics'
import Audit from './Audit'
import Traces from './Traces'
import Team from './Team'

const NAV_ITEMS = [
  { label: 'Overview', path: '' },
  { label: 'Transactions', path: 'transactions' },
  { label: 'Traces', path: 'traces' },
  { label: 'Providers', path: 'providers' },
  { label: 'Analytics', path: 'analytics' },
  { label: 'Users', path: 'users' },
  { label: 'Projects', path: 'projects' },
  { label: 'Team', path: 'team' },
  { label: 'Control Plane', path: 'control' },
  { label: 'Audit', path: 'audit' },
]

function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen bg-deepest-dark font-mono flex flex-col">
      <header className="bg-dark-grey-1 border-b border-dark-grey-3 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-almost-white tracking-tighter"><Wordmark textClassName="text-lg" /></Link>
          <span className="text-xs uppercase tracking-wider text-light-grey-1 px-2 py-1 border border-dark-grey-3 rounded">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard/developer" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Developer</Link>
            <Link to="/app" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">App</Link>
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
                to={`/dashboard/admin${item.path ? '/' + item.path : ''}`}
                className={`block px-6 py-3 text-sm transition-all duration-200 ${
                  active === item.path
                    ? 'text-almost-white bg-dark-grey-2 border-l-2 border-light-grey-3'
                    : 'text-light-grey-1 hover:text-light-grey-3 hover:bg-dark-grey-2'
                }`}
              >
                {item.label}
              </Link>
            ))}
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

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout active=""><Overview /></AdminLayout>} />
      <Route path="transactions" element={<AdminLayout active="transactions"><Transactions /></AdminLayout>} />
      <Route path="traces" element={<AdminLayout active="traces"><Traces /></AdminLayout>} />
      <Route path="providers" element={<AdminLayout active="providers"><Providers /></AdminLayout>} />
      <Route path="analytics" element={<AdminLayout active="analytics"><Analytics /></AdminLayout>} />
      <Route path="users" element={<AdminLayout active="users"><Users /></AdminLayout>} />
      <Route path="projects" element={<AdminLayout active="projects"><AdminProjects /></AdminLayout>} />
      <Route path="team" element={<AdminLayout active="team"><Team /></AdminLayout>} />
      <Route path="control" element={<AdminLayout active="control"><ControlPlane /></AdminLayout>} />
      <Route path="audit" element={<AdminLayout active="audit"><Audit /></AdminLayout>} />
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  )
}
