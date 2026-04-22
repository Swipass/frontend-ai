// src/pages/AdminDashboard/index.tsx
import { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
  return (
    <div style={{ height:'100vh', display:'grid', gridTemplateRows:'56px 1fr', gridTemplateColumns:'220px 1fr', background:'var(--gray-50)', fontFamily:"'DM Mono',monospace" }}>
      <header style={{ gridColumn:'1/-1', background:'var(--gray-100)', borderBottom:'1px solid var(--gray-300)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>
            <div style={{ width:24, height:24, border:'1.5px solid var(--gray-600)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-600)' }}>SW</div>
            Swipass
          </Link>
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-900)', padding:'0.2rem 0.6rem', background:'var(--gray-300)', border:'1px solid var(--gray-400)', borderRadius:3 }}>Admin</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/dashboard/developer" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>Dev Dashboard</Link>
          <Link to="/app" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>← App</Link>
        </div>
      </header>
      <nav style={{ background:'var(--gray-100)', borderRight:'1px solid var(--gray-300)', padding:'1.5rem 0' }}>
        <div style={{ padding:'0 1.25rem', marginBottom:'1.5rem', fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)' }}>Admin Panel</div>
        {NAV.map(item => (
          <Link key={item.label} to={`/dashboard/admin${item.path ? '/'+item.path : ''}`}
            style={{ display:'block', padding:'0.65rem 1.25rem', fontSize:'0.8rem', color: active===item.path ? 'var(--gray-900)' : 'var(--gray-500)', background: active===item.path ? 'var(--gray-200)' : 'transparent', borderLeft: active===item.path ? '2px solid var(--gray-700)' : '2px solid transparent', transition:'all 0.25s' }}>
            {item.label}
          </Link>
        ))}
      </nav>
      <main style={{ overflowY:'auto', padding:'2rem' }}>{children}</main>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { adminService.getOverview().then(setStats).catch(() => {}) }, [])
  if (!stats) return <div style={{ color:'var(--gray-500)', fontSize:'0.8rem' }}>Loading...</div>
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.75rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', margin:0 }}>System Overview</h1>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: stats.system_paused ? 'var(--gray-400)' : 'var(--gray-600)', animation: !stats.system_paused ? 'pulseDot 2s infinite' : 'none' }} />
          <span style={{ fontSize:'0.72rem', color: stats.system_paused ? 'var(--gray-400)' : 'var(--gray-600)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{stats.system_paused ? 'PAUSED' : 'LIVE'}</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {[
          ['Total Transactions', stats.total_transactions?.toLocaleString()],
          ['Total Volume', `$${(stats.total_volume_usd||0).toLocaleString(undefined,{minimumFractionDigits:2})}`],
          ['Total Fees', `$${(stats.total_fees_usd||0).toFixed(2)}`],
          ['Total Users', stats.total_users],
          ['Total Projects', stats.total_projects],
          ['Total Payouts', `$${(stats.total_payouts_usd||0).toFixed(2)}`],
        ].map(([l,v]) => (
          <div key={l as string} className="dash-card">
            <div style={{ fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.5rem' }}>{l}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.75rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>{v}</div>
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
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Transactions</h2>
      {loading ? <div style={{ color:'var(--gray-500)', fontSize:'0.8rem' }}>Loading...</div> : (
        <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', padding:'0.6rem 1rem', background:'var(--gray-200)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
            {['Command','Route','Volume','Fee','Provider','Status'].map(h=><span key={h}>{h}</span>)}
          </div>
          {txs.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--gray-500)', fontSize:'0.8rem' }}>No transactions yet</div>
          ) : txs.map(tx => (
            <div key={tx.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', padding:'0.7rem 1rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.75rem', alignItems:'center' }}>
              <span style={{ color:'var(--gray-700)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:'0.5rem' }}>{tx.command}</span>
              <span style={{ color:'var(--gray-500)' }}>{tx.from_chain}→{tx.to_chain}</span>
              <span style={{ color:'var(--gray-600)' }}>${(tx.volume_usd||0).toFixed(2)}</span>
              <span style={{ color:'var(--gray-600)' }}>${(tx.fee_usd||0).toFixed(4)}</span>
              <span style={{ color:'var(--gray-600)' }}>{tx.selected_provider}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.65rem', letterSpacing:'0.06em', textTransform:'uppercase', color: tx.status==='completed'?'var(--gray-600)':tx.status==='failed'?'var(--gray-400)':'var(--gray-500)' }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:tx.status==='completed'?'var(--gray-600)':tx.status==='failed'?'var(--gray-400)':'var(--gray-500)', flexShrink:0 }} />{tx.status}
              </span>
            </div>
          ))}
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
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Provider Management</h2>
      <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', marginBottom:'1.5rem' }}>Toggle providers on/off. Changes take effect immediately for all new intent requests.</p>
      {providers.map(p => (
        <div key={p.name} className="dash-card" style={{ marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'0.25rem' }}>{p.display_name}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--gray-500)' }}>Weight: {p.priority_weight} · Name: {p.name}</div>
          </div>
          <button onClick={() => toggle(p.name, p.is_active)}
            style={{ position:'relative', width:44, height:24, borderRadius:12, background: p.is_active ? 'var(--gray-600)' : 'var(--gray-300)', border:'none', cursor:'none', transition:'background 0.3s' }}>
            <div style={{ position:'absolute', top:2, left: p.is_active ? 22 : 2, width:20, height:20, borderRadius:'50%', background:'var(--gray-900)', transition:'left 0.25s' }} />
          </button>
        </div>
      ))}
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
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Users</h2>
      <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'0.6rem 1rem', background:'var(--gray-200)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
          {['Email','Role','Joined','Actions'].map(h=><span key={h}>{h}</span>)}
        </div>
        {users.length === 0 ? <div style={{ padding:'3rem', textAlign:'center', color:'var(--gray-500)', fontSize:'0.8rem' }}>No users yet</div>
        : users.map(u => (
          <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'0.7rem 1rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.75rem', alignItems:'center' }}>
            <span style={{ color:'var(--gray-700)' }}>{u.email}</span>
            <span style={{ color:'var(--gray-500)', fontSize:'0.65rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>{u.role || 'user'}</span>
            <span style={{ color:'var(--gray-500)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</span>
            <select value={u.role||''} onChange={e => updateRole(u.id, e.target.value)}
              style={{ background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:4, padding:'0.25rem 0.5rem', fontSize:'0.68rem', color:'var(--gray-600)', fontFamily:"'DM Mono',monospace", cursor:'pointer', width:'auto' }}>
              {ROLES.map(r => <option key={r} value={r}>{r || 'user'}</option>)}
            </select>
          </div>
        ))}
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
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Projects</h2>
      <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'0.6rem 1rem', background:'var(--gray-200)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
          {['Name','Status','Volume','Earned','Actions'].map(h=><span key={h}>{h}</span>)}
        </div>
        {projects.length === 0 ? <div style={{ padding:'3rem', textAlign:'center', color:'var(--gray-500)', fontSize:'0.8rem' }}>No projects</div>
        : projects.map(p => (
          <div key={p.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'0.7rem 1rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.75rem', alignItems:'center' }}>
            <span style={{ color:'var(--gray-700)', fontFamily:"'Syne',sans-serif", fontWeight:600 }}>{p.name}</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.65rem', letterSpacing:'0.06em', textTransform:'uppercase', color: p.status==='active' ? 'var(--gray-600)' : 'var(--gray-400)' }}>
              <span style={{ width:4, height:4, borderRadius:'50%', background: p.status==='active' ? 'var(--gray-600)' : 'var(--gray-400)' }} />{p.status}
            </span>
            <span style={{ color:'var(--gray-600)' }}>${(p.total_volume_usd||0).toFixed(0)}</span>
            <span style={{ color:'var(--gray-600)' }}>${(p.total_earned||0).toFixed(2)}</span>
            <button onClick={() => togglePause(p.id, p.status)} style={{ background:'none', border:'1px solid var(--gray-300)', borderRadius:4, padding:'0.25rem 0.5rem', fontSize:'0.65rem', color:'var(--gray-500)', cursor:'none', fontFamily:"'DM Mono',monospace" }}>
              {p.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
          </div>
        ))}
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
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>System Controls</h2>
      <div className="dash-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'0.5rem' }}>Global Circuit Breaker</div>
        <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', lineHeight:1.6, marginBottom:'1rem' }}>When paused, all /v1/intent requests will return 503. Use this for emergency maintenance.</p>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: paused ? 'var(--gray-400)' : 'var(--gray-600)', animation: !paused ? 'pulseDot 2s infinite' : 'none' }} />
            <span style={{ fontSize:'0.75rem', color: paused ? 'var(--gray-400)' : 'var(--gray-600)', letterSpacing:'0.08em', textTransform:'uppercase' }}>System {paused ? 'PAUSED' : 'LIVE'}</span>
          </div>
          <button onClick={toggleSystem} disabled={loading}
            className={`sw-btn ${paused ? 'sw-btn-primary' : 'sw-btn-ghost'}`} style={{ fontSize:'0.7rem', padding:'0.5rem 1rem' }}>
            {loading ? '...' : paused ? 'Resume System' : '⚠️ Pause System'}
          </button>
        </div>
      </div>
      <div className="dash-card">
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'0.5rem' }}>Admin Credentials</div>
        <div style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.8 }}>
          Admin account is auto-created from <code style={{ background:'var(--gray-200)', padding:'1px 4px', borderRadius:3, fontSize:'0.72rem' }}>.env</code> on startup.<br />
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
        // Check if user has any admin role (super_admin, staff_support, staff_finance, staff_moderator)
        const adminRoles = ['super_admin', 'staff_support', 'staff_finance', 'staff_moderator']
        if (adminRoles.includes(role)) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          // Redirect non-admin users to developer dashboard
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
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--gray-500)' }}>Checking permissions...</div>
  }

  return isAdmin ? <>{children}</> : null
}

export default function AdminDashboard() {
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