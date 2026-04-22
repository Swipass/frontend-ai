// src/pages/DeveloperDashboard/index.tsx
import { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { label: 'Overview', path: '' },
  { label: 'Projects', path: 'projects' },
  { label: 'Earnings', path: 'earnings' },
  { label: 'Settings', path: 'settings' },
]

function DashLayout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div style={{ height:'100vh', display:'grid', gridTemplateRows:'56px 1fr', gridTemplateColumns:'220px 1fr', background:'var(--gray-50)', fontFamily:"'DM Mono',monospace" }}>
      <header style={{ gridColumn:'1/-1', background:'var(--gray-100)', borderBottom:'1px solid var(--gray-300)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>
            <div style={{ width:24, height:24, border:'1.5px solid var(--gray-500)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-500)' }}>SW</div>
            Swipass
          </Link>
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', padding:'0.2rem 0.6rem', border:'1px solid var(--gray-300)', borderRadius:3 }}>Developer</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/app" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>← App</Link>
          <Link to="/docs" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>Docs</Link>
        </div>
      </header>
      <nav style={{ background:'var(--gray-100)', borderRight:'1px solid var(--gray-300)', padding:'1.5rem 0' }}>
        <div style={{ padding:'0 1.25rem', marginBottom:'1.5rem', fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)' }}>Navigation</div>
        {NAV_ITEMS.map(item => (
          <Link key={item.label} to={`/dashboard/developer${item.path ? '/'+item.path : ''}`}
            style={{ display:'block', padding:'0.65rem 1.25rem', fontSize:'0.8rem', color: active===item.path ? 'var(--gray-900)' : 'var(--gray-500)', background: active===item.path ? 'var(--gray-200)' : 'transparent', borderLeft: active===item.path ? '2px solid var(--gray-700)' : '2px solid transparent', transition:'all 0.25s' }}>
            {item.label}
          </Link>
        ))}
        <div style={{ margin:'1.5rem 1.25rem 0', paddingTop:'1.5rem', borderTop:'1px solid var(--gray-300)' }}>
          <Link to="/dashboard/admin" style={{ display:'block', padding:'0.65rem 0', fontSize:'0.75rem', color:'var(--gray-500)', transition:'color 0.25s' }}>Admin Panel →</Link>
        </div>
      </nav>
      <main style={{ overflowY:'auto', padding:'2rem' }}>{children}</main>
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
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.75rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'0.5rem' }}>Developer Overview</h1>
      <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', marginBottom:'2rem' }}>Manage your Swipass integrations and track earnings.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {[
          { label:'Total Projects', value: projects.length },
          { label:'Total Earned', value:`$${totalEarned.toFixed(2)}` },
          { label:'Total Volume', value:`$${totalVolume.toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="dash-card">
            <div style={{ fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.5rem' }}>{s.label}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.75rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="dash-card">
        <div style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--gray-300)' }}>Quick Start</div>
        <pre style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', color:'var(--gray-600)', lineHeight:1.8, background:'var(--gray-200)', padding:'1.25rem', borderRadius:6, overflow:'auto' }}>
{`curl -X POST https://api.swipass.xyz/v1/intent \\
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

  if (loading) return <div style={{ color:'var(--gray-500)', fontSize:'0.8rem' }}>Loading...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', margin:0 }}>Projects</h2>
        <button onClick={() => setCreating(true)} className="sw-btn sw-btn-primary" style={{ fontSize:'0.7rem', padding:'0.5rem 1rem' }}>+ New Project</button>
      </div>

      {newKey && (
        <div style={{ padding:'1.25rem', background:'var(--gray-200)', border:'1px solid var(--gray-400)', borderRadius:8, marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.5rem' }}>⚠️ Save your API key — shown once only</div>
          <code style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.85rem', color:'var(--gray-900)', wordBreak:'break-all', display:'block', marginBottom:'0.75rem' }}>{newKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copied!') }} className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.75rem' }}>Copy Key</button>
          <button onClick={() => setNewKey('')} style={{ marginLeft:'0.5rem', background:'none', border:'none', fontSize:'0.68rem', color:'var(--gray-500)', cursor:'none', fontFamily:"'DM Mono',monospace" }}>Dismiss</button>
        </div>
      )}

      {creating && (
        <div className="dash-card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'1rem' }}>Create Project</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name" onKeyDown={e => e.key==='Enter' && create()}
            style={{ width:'100%', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:5, padding:'0.5rem 0.75rem', fontFamily:"'DM Mono',monospace", fontSize:'0.82rem', color:'var(--gray-800)', outline:'none', marginBottom:'0.75rem' }} />
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button onClick={create} className="sw-btn sw-btn-primary" style={{ fontSize:'0.7rem', padding:'0.5rem 1rem' }}>Create</button>
            <button onClick={() => setCreating(false)} className="sw-btn sw-btn-ghost" style={{ fontSize:'0.7rem', padding:'0.5rem 1rem' }}>Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="dash-card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', margin:0 }}>No projects yet. Create one to get started.</p>
        </div>
      ) : projects.map(p => (
        <div key={p.id} className="dash-card" style={{ marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'0.25rem' }}>{p.name}</div>
              <code style={{ fontSize:'0.72rem', color:'var(--gray-500)', fontFamily:"'DM Mono',monospace" }}>{p.api_key_prefix}...</code>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <span style={{ padding:'0.2rem 0.55rem', background: p.status==='active' ? 'var(--gray-300)' : 'var(--gray-400)', borderRadius:3, fontSize:'0.65rem', letterSpacing:'0.08em', textTransform:'uppercase', color: p.status==='active' ? 'var(--gray-700)' : 'var(--gray-900)' }}>{p.status}</span>
              <button onClick={() => del(p.id)} style={{ background:'none', border:'none', color:'var(--gray-400)', cursor:'none', fontSize:'0.72rem', fontFamily:"'DM Mono',monospace" }}>Delete</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
            {[['Pending Balance',`$${(p.pending_balance||0).toFixed(2)}`],['Total Earned',`$${(p.total_earned||0).toFixed(2)}`],['Total Volume',`$${(p.total_volume_usd||0).toFixed(0)}`]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.2rem' }}>{l}</div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:600, color:'var(--gray-800)' }}>{v}</div></div>
            ))}
          </div>
          {p.pending_balance >= 50 && p.payout_wallet && (
            <button onClick={async () => { await platformService.requestPayout(p.id); toast.success('Payout requested!'); load() }}
              className="sw-btn sw-btn-primary" style={{ marginTop:'0.75rem', fontSize:'0.7rem', padding:'0.4rem 0.85rem' }}>
              Withdraw ${(p.pending_balance||0).toFixed(2)}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function Earnings() {
  return (
    <div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Earnings</h2>
      <div className="dash-card" style={{ textAlign:'center', padding:'3rem' }}>
        <p style={{ color:'var(--gray-500)', fontSize:'0.82rem' }}>Revenue data will appear here as your projects accumulate volume.</p>
        <div style={{ marginTop:'1.5rem', fontSize:'0.75rem', color:'var(--gray-400)', lineHeight:1.8 }}>
          Fee structure: 0.15% on all developer-driven transactions<br />
          Your share: 50% (0.075%)<br />
          Minimum payout: $50 USD
        </div>
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Settings</h2>
      <div className="dash-card">
        <div style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'1rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--gray-300)' }}>Account</div>
        <p style={{ color:'var(--gray-500)', fontSize:'0.82rem' }}>Sign in via Clerk to manage your account settings, update email, and manage team access.</p>
        <a href="/auth" className="sw-btn sw-btn-primary" style={{ display:'inline-flex', marginTop:'1rem', fontSize:'0.7rem', padding:'0.5rem 1rem' }}>Sign In</a>
      </div>
    </div>
  )
}

export default function DeveloperDashboard() {
  const [active, setActive] = useState('')
  return (
    <Routes>
      <Route path="/" element={<DashLayout active=""><Overview /></DashLayout>} />
      <Route path="projects" element={<DashLayout active="projects"><Projects /></DashLayout>} />
      <Route path="earnings" element={<DashLayout active="earnings"><Earnings /></DashLayout>} />
      <Route path="settings" element={<DashLayout active="settings"><Settings /></DashLayout>} />
    </Routes>
  )
}
