// src/pages/AdminDashboard/index.tsx
import { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { adminService } from '../../services/platformService'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'

const NAV = [
  { label:'Overview', path:'' },
  { label:'Transactions', path:'transactions' },
  { label:'Providers', path:'providers' },
  { label:'Users', path:'users' },
  { label:'Projects', path:'projects' },
  { label:'System', path:'system' },
]

function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

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
          <span className="text-xs uppercase tracking-wider text-almost-white px-2 py-1 bg-dark-grey-2 border border-mid-grey rounded">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3">
            <Link to="/dashboard/developer" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Dev Dashboard</Link>
            <Link to="/app" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">← App</Link>
          </div>
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
        {/* Sidebar – collapsible on mobile */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-dark-grey-1 border-r border-dark-grey-3 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:block
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-dark-grey-3">
            <div className="text-xs uppercase tracking-wider text-light-grey-1">Admin Panel</div>
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
            {NAV.map(item => (
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
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { adminService.getOverview().then(setStats).catch(() => {}) }, [])
  if (!stats) return <div className="text-light-grey-1 text-sm">Loading...</div>
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter">System Overview</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stats.system_paused ? 'bg-mid-grey' : 'bg-light-grey-2'} ${!stats.system_paused ? 'animate-pulse' : ''}`} />
          <span className="text-xs uppercase tracking-wider text-light-grey-1">{stats.system_paused ? 'PAUSED' : 'LIVE'}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          ['Total Transactions', stats.total_transactions?.toLocaleString()],
          ['Total Volume', `$${(stats.total_volume_usd||0).toLocaleString(undefined,{minimumFractionDigits:2})}`],
          ['Total Fees', `$${(stats.total_fees_usd||0).toFixed(2)}`],
          ['Total Users', stats.total_users],
          ['Total Projects', stats.total_projects],
          ['Total Payouts', `$${(stats.total_payouts_usd||0).toFixed(2)}`],
        ].map(([l,v]) => (
          <div key={l as string} className="dash-card">
            <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">{l}</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Transactions() {
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { adminService.listTransactions(50).then(d => setTxs(d.transactions||[])).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">Transactions</h2>
      {loading ? <div className="text-light-grey-1 text-sm">Loading...</div> : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Command</th>
                <th className="p-3 text-left">Route</th>
                <th className="p-3 text-left">Volume</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-light-grey-1">No transactions yet</td></tr>
              ) : txs.map(tx => (
                <tr key={tx.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 text-light-grey-3 max-w-[200px] truncate">{tx.command}</td>
                  <td className="p-3 text-light-grey-1">{tx.from_chain}→{tx.to_chain}</td>
                  <td className="p-3 text-light-grey-2">${(tx.volume_usd||0).toFixed(2)}</td>
                  <td className="p-3 text-light-grey-2">${(tx.fee_usd||0).toFixed(4)}</td>
                  <td className="p-3 text-light-grey-2">{tx.selected_provider}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs uppercase tracking-wider ${
                      tx.status === 'completed' ? 'text-light-grey-2' :
                      tx.status === 'failed' ? 'text-mid-grey' : 'text-light-grey-1'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tx.status === 'completed' ? 'bg-light-grey-2' :
                        tx.status === 'failed' ? 'bg-mid-grey' : 'bg-light-grey-1 animate-pulse'
                      }`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Providers() {
  const [providers, setProviders] = useState<any[]>([])
  useEffect(() => { adminService.listProviders().then(d => setProviders(d.providers||[])).catch(()=>{}) }, [])
  const toggle = async (name: string, current: boolean) => {
    await adminService.toggleProvider(name, !current)
    setProviders(prev => prev.map(p => p.name===name ? {...p, is_active: !current} : p))
    toast.success(`${name} ${!current ? 'enabled' : 'disabled'}`)
  }
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-4">Provider Management</h2>
      <p className="text-light-grey-1 text-sm mb-6">Toggle providers on/off. Changes take effect immediately for all new intent requests.</p>
      <div className="space-y-3">
        {providers.map(p => (
          <div key={p.name} className="dash-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="font-display text-base font-semibold text-almost-white">{p.display_name}</div>
              <div className="text-xs text-light-grey-1 mt-0.5">Weight: {p.priority_weight} · Name: {p.name}</div>
            </div>
            <button
              onClick={() => toggle(p.name, p.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                p.is_active ? 'bg-light-grey-2' : 'bg-mid-grey'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-almost-white transition-transform duration-300 ${
                p.is_active ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Users() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => { adminService.listUsers().then(d => setUsers(d.users||[])).catch(()=>{}) }, [])
  const updateRole = async (id: string, role: string) => {
    await adminService.updateUserRole(id, role || null)
    setUsers(prev => prev.map(u => u.id===id ? {...u, role} : u))
    toast.success('Role updated')
  }
  const ROLES = ['','developer','staff_support','staff_finance','staff_moderator','super_admin']
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">Users</h2>
      <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-light-grey-1">No users yet</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                <td className="p-3 text-light-grey-3">{u.email}</td>
                <td className="p-3 text-light-grey-1 uppercase tracking-wider text-xs">{u.role || 'user'}</td>
                <td className="p-3 text-light-grey-1">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                <td className="p-3">
                  <select
                    value={u.role||''}
                    onChange={e => updateRole(u.id, e.target.value)}
                    className="bg-dark-grey-2 border border-mid-grey rounded px-2 py-1 text-xs text-light-grey-2 font-mono focus:outline-none focus:border-light-grey-1"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r || 'user'}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([])
  useEffect(() => { adminService.listProjects().then(d => setProjects(d.projects||[])).catch(()=>{}) }, [])
  const togglePause = async (id: string, current: string) => {
    const paused = current !== 'paused'
    await adminService.pauseProject(id, paused)
    setProjects(prev => prev.map(p => p.id===id ? {...p, status: paused ? 'paused' : 'active'} : p))
    toast.success(paused ? 'Project paused' : 'Project resumed')
  }
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">Projects</h2>
      <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Volume</th>
              <th className="p-3 text-left">Earned</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-light-grey-1">No projects</td></tr>
            ) : projects.map(p => (
              <tr key={p.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                <td className="p-3 font-display font-semibold text-almost-white">{p.name}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs uppercase tracking-wider ${
                    p.status === 'active' ? 'text-light-grey-2' : 'text-mid-grey'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-light-grey-2' : 'bg-mid-grey'}`} />
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-light-grey-2">${(p.total_volume_usd||0).toFixed(0)}</td>
                <td className="p-3 text-light-grey-2">${(p.total_earned||0).toFixed(2)}</td>
                <td className="p-3">
                  <button
                    onClick={() => togglePause(p.id, p.status)}
                    className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition"
                  >
                    {p.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function System() {
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => { adminService.getOverview().then(d => setPaused(d.system_paused||false)).catch(()=>{}) }, [])
  const toggleSystem = async () => {
    setLoading(true)
    await adminService.pauseSystem(!paused)
    setPaused(!paused)
    toast.success(paused ? 'System resumed' : 'System PAUSED')
    setLoading(false)
  }
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-almost-white tracking-tighter mb-6">System Controls</h2>
      <div className="dash-card mb-6">
        <div className="font-display text-base font-semibold text-almost-white mb-2">Global Circuit Breaker</div>
        <p className="text-light-grey-1 text-sm leading-relaxed mb-4">When paused, all /v1/intent requests will return 503. Use this for emergency maintenance.</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${paused ? 'bg-mid-grey' : 'bg-light-grey-2'} ${!paused ? 'animate-pulse' : ''}`} />
            <span className="text-xs uppercase tracking-wider text-light-grey-1">System {paused ? 'PAUSED' : 'LIVE'}</span>
          </div>
          <button
            onClick={toggleSystem}
            disabled={loading}
            className={`sw-btn ${paused ? 'sw-btn-primary' : 'sw-btn-ghost'} text-xs py-1.5 px-4`}
          >
            {loading ? '...' : paused ? 'Resume System' : '⚠️ Pause System'}
          </button>
        </div>
      </div>
      <div className="dash-card">
        <div className="font-display text-base font-semibold text-almost-white mb-2">Admin Credentials</div>
        <div className="text-xs text-light-grey-1 leading-relaxed">
          Admin account is auto-created from <code className="bg-dark-grey-2 px-1 rounded text-light-grey-2">.env</code> on startup.<br />
          Email: ADMIN_EMAIL<br />Password: ADMIN_PASSWORD<br />Role: super_admin
        </div>
      </div>
    </div>
  )
}

// Admin role guard wrapper
function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const me = await platformService.getMe()
        const role = me.role
        const adminRoles = ['super_admin', 'staff_support', 'staff_finance', 'staff_moderator']
        if (adminRoles.includes(role)) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          navigate('/dashboard/developer', { replace: true })
          toast.error('Admin access restricted. Redirecting to developer dashboard.')
        }
      } catch (err) {
        console.error('Failed to fetch user role', err)
        setIsAdmin(false)
        navigate('/dashboard/developer', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [navigate])

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-light-grey-1">Checking permissions...</div>
  }

  return isAdmin ? <>{children}</> : null
}

export default function AdminDashboard() {
  const location = useLocation()
  const activePath = location.pathname.split('/').pop() || ''
  const active = activePath === 'admin' ? '' : activePath

  return (
    <AdminGuard>
      <Routes>
        <Route path="/" element={<AdminLayout active=""><Overview /></AdminLayout>} />
        <Route path="transactions" element={<AdminLayout active="transactions"><Transactions /></AdminLayout>} />
        <Route path="providers" element={<AdminLayout active="providers"><Providers /></AdminLayout>} />
        <Route path="users" element={<AdminLayout active="users"><Users /></AdminLayout>} />
        <Route path="projects" element={<AdminLayout active="projects"><AdminProjects /></AdminLayout>} />
        <Route path="system" element={<AdminLayout active="system"><System /></AdminLayout>} />
      </Routes>
    </AdminGuard>
  )
}