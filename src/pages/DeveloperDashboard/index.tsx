// src/pages/DeveloperDashboard/index.tsx
import { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { label: 'Overview', path: '' },
  { label: 'Projects', path: 'projects' },
  { label: 'Earnings', path: 'earnings' },
  { label: 'Settings', path: 'settings' },
]

function DashLayout({ children, active }: { children: React.ReactNode; active: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-deepest-dark font-mono flex flex-col">
      {/* Header */}
      <header className="bg-dark-grey-1 border-b border-dark-grey-3 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-almost-white tracking-tighter">
            Swipass
          </Link>
          <span className="text-xs uppercase tracking-wider text-light-grey-1 px-2 py-1 border border-dark-grey-3 rounded">Developer</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop navigation links */}
          <div className="hidden md:flex gap-4">
            <Link to="/app" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">← App</Link>
            <Link to="/docs" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Docs</Link>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-almost-white w-8 h-8 flex items-center justify-center border border-dark-grey-3 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – hidden on mobile unless open */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-dark-grey-1 border-r border-dark-grey-3 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:block
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-dark-grey-3">
            <div className="text-xs uppercase tracking-wider text-light-grey-1">Navigation</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 md:hidden text-light-grey-1"
            >
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
            <div className="mt-8 pt-4 border-t border-dark-grey-3 px-6">
              <Link to="/dashboard/admin" className="block text-sm text-light-grey-1 hover:text-light-grey-3 transition-colors">
                Admin Panel →
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function Overview() {
  const [projects, setProjects] = useState<any[]>([])
  useEffect(() => { platformService.listProjects().then(setProjects).catch(() => {}) }, [])
  const totalEarned = projects.reduce((s,p) => s + (p.total_earned||0), 0)
  const totalVolume = projects.reduce((s,p) => s + (p.total_volume_usd||0), 0)
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-2">Developer Overview</h1>
      <p className="text-light-grey-1 text-sm mb-6">Manage your Swipass integrations and track earnings.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label:'Total Projects', value: projects.length },
          { label:'Total Earned', value:`$${totalEarned.toFixed(2)}` },
          { label:'Total Volume', value:`$${totalVolume.toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="dash-card">
            <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">{s.label}</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="dash-card">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 pb-2 border-b border-dark-grey-3 mb-3">Quick Start</div>
        <pre className="font-mono text-xs sm:text-sm text-light-grey-2 leading-relaxed bg-dark-grey-2 p-4 rounded-md overflow-auto">
{`curl -X POST https://www.swipass.com/v1/intent \\
  -H "X-API-Key: sw_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Bridge 1 ETH to Polygon",
    "destination_address": "0x..."
  }'`}
        </pre>
      </div>
    </div>
  )
}

function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newKeyProjectId, setNewKeyProjectId] = useState('')

  const load = () => platformService.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    try {
      const res = await platformService.createProject(newName.trim())
      setNewKey(res.api_key); setNewKeyProjectId(res.project_id)
      setNewName(''); setCreating(false); load()
      toast.success('Project created!')
    } catch (e: any) { toast.error(e.message) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await platformService.deleteProject(id); load(); toast.success('Deleted')
  }

  if (loading) return <div className="text-light-grey-1 text-sm">Loading...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter">Projects</h2>
        <button onClick={() => setCreating(true)} className="sw-btn sw-btn-primary text-xs sm:text-sm py-2 px-4">
          + New Project
        </button>
      </div>

      {newKey && (
        <div className="p-4 bg-dark-grey-2 border border-mid-grey rounded-lg mb-4">
          <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-2">⚠️ Save your API key — shown once only</div>
          <code className="font-mono text-sm text-almost-white break-all block mb-3">{newKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copied!') }} className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Copy Key</button>
          <button onClick={() => setNewKey('')} className="ml-2 bg-none border-none text-xs text-light-grey-1 hover:text-light-grey-3 font-mono">Dismiss</button>
        </div>
      )}

      {creating && (
        <div className="dash-card mb-4">
          <div className="font-display text-base font-semibold text-almost-white mb-3">Create Project</div>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Project name"
            onKeyDown={e => e.key==='Enter' && create()}
            className="w-full bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-sm font-mono text-light-grey-3 focus:outline-none focus:border-light-grey-1 mb-3"
          />
          <div className="flex gap-3">
            <button onClick={create} className="sw-btn sw-btn-primary text-xs py-2 px-4">Create</button>
            <button onClick={() => setCreating(false)} className="sw-btn sw-btn-ghost text-xs py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="dash-card text-center py-12">
          <p className="text-light-grey-1 text-sm">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="dash-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div>
                  <div className="font-display text-lg font-semibold text-almost-white">{p.name}</div>
                  <code className="text-xs text-light-grey-1 font-mono">{p.api_key_prefix}...</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                    p.status === 'active' ? 'bg-dark-grey-3 text-light-grey-2' : 'bg-mid-grey text-almost-white'
                  }`}>{p.status}</span>
                  <button onClick={() => del(p.id)} className="text-xs text-light-grey-1 hover:text-light-grey-3 font-mono bg-none border-none">Delete</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                {[
                  ['Pending Balance', `$${(p.pending_balance||0).toFixed(2)}`],
                  ['Total Earned', `$${(p.total_earned||0).toFixed(2)}`],
                  ['Total Volume', `$${(p.total_volume_usd||0).toFixed(0)}`],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-0.5">{l}</div>
                    <div className="font-display text-base font-semibold text-light-grey-3">{v}</div>
                  </div>
                ))}
              </div>
              {p.pending_balance >= 50 && p.payout_wallet && (
                <button
                  onClick={async () => { await platformService.requestPayout(p.id); toast.success('Payout requested!'); load() }}
                  className="sw-btn sw-btn-primary text-xs py-1.5 px-3 mt-4"
                >
                  Withdraw ${(p.pending_balance||0).toFixed(2)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Earnings() {
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">Earnings</h2>
      <div className="dash-card text-center py-12">
        <p className="text-light-grey-1 text-sm">Revenue data will appear here as your projects accumulate volume.</p>
        <div className="mt-6 text-xs text-light-grey-2 leading-relaxed space-y-1">
          <div>Fee structure: 0.15% on all developer-driven transactions</div>
          <div>Your share: 50% (0.075%)</div>
          <div>Minimum payout: $50 USD</div>
        </div>
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">Settings</h2>
      <div className="dash-card">
        <div className="text-xs uppercase tracking-wider text-light-grey-1 pb-2 border-b border-dark-grey-3 mb-4">Account</div>
        <p className="text-light-grey-1 text-sm mb-4">Sign in via Clerk to manage your account settings, update email, and manage team access.</p>
        <a href="/auth" className="sw-btn sw-btn-primary inline-flex text-xs py-2 px-4">Sign In</a>
      </div>
    </div>
  )
}

export default function DeveloperDashboard() {
  const location = useLocation()
  const activePath = location.pathname.split('/').pop() || ''
  const active = activePath === 'developer' ? '' : activePath

  return (
    <Routes>
      <Route path="/" element={<DashLayout active=""><Overview /></DashLayout>} />
      <Route path="projects" element={<DashLayout active="projects"><Projects /></DashLayout>} />
      <Route path="earnings" element={<DashLayout active="earnings"><Earnings /></DashLayout>} />
      <Route path="settings" element={<DashLayout active="settings"><Settings /></DashLayout>} />
    </Routes>
  )
}