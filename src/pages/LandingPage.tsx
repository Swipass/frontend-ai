// src/pages/LandingPage.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { intentService, SystemStats } from '../services/intentService'

// ─── Three.js WebGL Scene ───────────────────────────────────────────────────
function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !(window as any).THREE) return
    const THREE = (window as any).THREE
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 10)
    scene.add(new THREE.AmbientLight(0xffffff, 0.15))
    const light1 = new THREE.DirectionalLight(0xffffff, 1.2); light1.position.set(4, 6, 6); scene.add(light1)
    const light2 = new THREE.PointLight(0xaaaaaa, 1.5, 40); light2.position.set(-6, -4, 4); scene.add(light2)
    const light3 = new THREE.PointLight(0xffffff, 0.8, 30); light3.position.set(6, 4, -4); scene.add(light3)
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.0, 96, 96), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.0, roughness: 0.0, transmission: 0.92, thickness: 2.0, ior: 1.5, reflectivity: 0.9, transparent: true, opacity: 0.65 }))
    scene.add(sphere)
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.005, 2, 256), new THREE.MeshBasicMaterial({ color: 0x404040, transparent: true, opacity: 0.6 })); ring1.rotation.x = Math.PI * 0.3; scene.add(ring1)
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.003, 2, 256), new THREE.MeshBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0.4 })); ring2.rotation.x = Math.PI * 0.6; ring2.rotation.z = Math.PI * 0.2; scene.add(ring2)
    const PARTICLE_COUNT = 3200; const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) { const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 4 + Math.random() * 18; positions[i*3]=r*Math.sin(ph)*Math.cos(th); positions[i*3+1]=r*Math.sin(ph)*Math.sin(th); positions[i*3+2]=r*Math.cos(ph) }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x666666, size: 0.05, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending })); scene.add(particles)
    const orbitals: any[] = []
    ;[{ radius:3.8, speed:0.28, size:0.08, phase:0, tiltX:0.4 },{ radius:4.4, speed:0.18, size:0.05, phase:2.1, tiltX:-0.3 },{ radius:3.2, speed:0.38, size:0.06, phase:4.2, tiltX:0.7 }].forEach(d => { const m = new THREE.Mesh(new THREE.SphereGeometry(d.size,12,12), new THREE.MeshBasicMaterial({ color:0x888888, transparent:true, opacity:0.7 })); scene.add(m); orbitals.push({ mesh:m, ...d }) })
    const gridHelper = new THREE.GridHelper(40, 40, 0x1a1a1a, 0x1a1a1a); gridHelper.position.y = -6; (gridHelper.material as any).transparent = true; (gridHelper.material as any).opacity = 0.25; scene.add(gridHelper)
    let tX = 0, tY = 0, cX = 0, cY = 0
    const onMouse = (e: MouseEvent) => { tY = ((e.clientX/window.innerWidth)-0.5)*0.6; tX = ((e.clientY/window.innerHeight)-0.5)*0.4 }
    window.addEventListener('mousemove', onMouse)
    const onResize = () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight) }
    window.addEventListener('resize', onResize)
    const clock = new THREE.Clock(); let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      cX += (tX - cX) * 0.04; cY += (tY - cY) * 0.04
      sphere.rotation.y = t * 0.06 + cY; sphere.rotation.x = cX * 0.5
      sphere.scale.setScalar(1 + Math.sin(t * 0.9) * 0.012)
      ring1.rotation.z = t * 0.07; ring2.rotation.y = t * 0.05; ring1.rotation.y = cY * 0.3
      particles.rotation.y = t * 0.018; particles.rotation.x = t * 0.008
      ;(particles.material as any).opacity = 0.28 + Math.sin(t*0.4)*0.08
      orbitals.forEach(o => { const a = t*o.speed+o.phase; o.mesh.position.x = Math.cos(a)*o.radius; o.mesh.position.y = Math.sin(a*o.tiltX)*1.2; o.mesh.position.z = Math.sin(a)*o.radius*0.6 })
      ;(light2 as any).intensity = 1.2 + Math.sin(t*0.7)*0.4
      gridHelper.position.y = -6 + Math.sin(t*0.3)*0.15
      renderer.render(scene, camera)
    }
    animate()
    return () => { window.removeEventListener('mousemove', onMouse); window.removeEventListener('resize', onResize); cancelAnimationFrame(rafId); renderer.dispose() }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }} />
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0 }: { target: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = Date.now(); const duration = 1800
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(eased * target)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()
  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

// ─── Terminal animation ───────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { type: 'cmd', text: 'Bridge 1 ETH from Arbitrum to Polygon' },
  { type: 'out', text: '↳ Parsing intent via LLM...' },
  { type: 'out', text: '↳ Querying 3 providers concurrently...' },
  { type: 'spacer' },
  { type: 'out', text: '  Provider      Output        Time    Score' },
  { type: 'out', text: '  ─────────────────────────────────────────' },
  { type: 'highlight', text: '  0x             0.9982 ETH    18s     94.2' },
  { type: 'dim', text: '  LI.FI           0.9971 ETH    22s     89.1' },
  { type: 'dim', text: '  Across          0.9968 ETH    31s     81.4' },
  { type: 'spacer' },
  { type: 'out', text: '↳ Selected: 0x (highest score)' },
  { type: 'highlight', text: '  ✓ Ready to sign. Awaiting wallet confirmation.' },
]

function Terminal() {
  const [lines, setLines] = useState<{ text: string; type: string }[]>([])
  const [cursor, setCursor] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)
  const runTerminal = useCallback(async () => {
    setLines([])
    for (let i = 0; i < TERMINAL_LINES.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 600 : 130))
      setLines(prev => [...prev, TERMINAL_LINES[i] as any])
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
    setCursor(true)
    setTimeout(runTerminal, 5000)
  }, [])
  useEffect(() => { runTerminal() }, [runTerminal])
  useEffect(() => { const iv = setInterval(() => setCursor(v => !v), 550); return () => clearInterval(iv) }, [])
  const colorMap: any = { out: '#666666', highlight: '#e5e5e5', dim: '#404040', cmd: '#d4d4d4' }
  return (
    <div style={{ border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden', background:'#0a0a0a', boxShadow:'0 0 80px rgba(0,0,0,0.6)' }}>
      <div style={{ background:'#1a1a1a', padding:'0.75rem 1rem', display:'flex', gap:'0.5rem', borderBottom:'1px solid #2a2a2a' }}>
        {[0,1,2].map(i => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:'#404040' }} />)}
      </div>
      <div ref={bodyRef} style={{ padding:'1.5rem', fontFamily:"'DM Mono',monospace", fontSize:'0.8rem', minHeight:240, maxHeight:280, overflowY:'auto' }}>
        {lines.map((l, i) => l.type === 'spacer' ? <div key={i} style={{ height:'0.5rem' }} /> : (
          <div key={i} style={{ marginBottom:'0.4rem', display:'flex', gap:'0.75rem' }}>
            {l.type === 'cmd' && <span style={{ color:'#666' }}>{'>'}</span>}
            <span style={{ color: colorMap[l.type] || '#666', paddingLeft: l.type !== 'cmd' ? '1.5rem' : 0 }}>{l.text}</span>
          </div>
        ))}
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <span style={{ color:'#666' }}>{'>'}</span>
          <span style={{ display:'inline-block', width:7, height:14, background: cursor ? '#666' : 'transparent', verticalAlign:'middle' }} />
        </div>
      </div>
    </div>
  )
}

const FAQS = [
  { q: 'Do I need to create an account?', a: 'No. Anyone can visit Swipass, connect a wallet, and start issuing commands immediately. No email, no sign-up. Only developers and admins need an account.' },
  { q: 'How does Swipass pick the best route?', a: 'All enabled providers are queried simultaneously. Each quote is scored: 70% output amount, 20% speed, 10% historical success rate over the past 30 days.' },
  { q: 'Is my voice data stored?', a: 'Never. Transcription runs in WebAssembly locally in your browser. Only the resulting text command is sent to our servers.' },
  { q: 'What if a provider fails?', a: 'Swipass automatically falls back to the next best provider from the original quote set without interrupting your experience.' },
  { q: 'How do I earn as a developer?', a: 'Integrate the /v1/intent endpoint with your API key. Every transaction your users execute generates 0.075% in fees accumulated in your project balance, withdrawable at $50.' },
  { q: 'Can I bring my own LLM?', a: 'Yes. Pass X-LLM-Provider, X-LLM-API-Key, and X-LLM-Model headers per request. Keys are used only for that session and never stored.' },
  { q: 'Does Swipass hold my funds?', a: 'No. Swipass is fully non-custodial. You always sign transactions from your own wallet. No private keys are ever requested.' },
]

const MARQUEE_ITEMS = ['Voice-First DeFi','50+ Chains','No Account Required','Intelligent Routing','50% Revenue Share','BYO-LLM','Non-Custodial','WebAssembly Transcription','Multi-Provider','Performance Scoring','Instant Failover','PWA Ready']

export default function LandingPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Load Three.js
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => document.body.dispatchEvent(new Event('three-loaded'))
    document.head.appendChild(script)

    // Fetch real stats from backend
    intentService.getStats().then(setStats).catch(() => {})

    // Navbar scroll
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    // Reveal on scroll
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el))

    // Cursor hover
    const addHover = () => {
      document.querySelectorAll('a,button,.sw-chip,.feature-card,.faq-btn,.provider-card,.sec-card,.qc-chip').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'))
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'))
      })
    }
    setTimeout(addHover, 200)

    return () => {
      window.removeEventListener('scroll', onScroll)
      revealObserver.disconnect()
    }
  }, [])

  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
      <WebGLScene />

      {/* NAV */}
      <nav ref={navRef} style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'1.5rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid transparent', transition:'all 0.3s' }}
        className="nav-scrolled">
        <style>{`.nav-scrolled.scrolled { background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-color: var(--gray-300) !important; padding: 1rem 2rem !important; }`}</style>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontFamily:"'Syne',sans-serif", fontSize:'1.35rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>
          <div style={{ width:28, height:28, border:'1.5px solid var(--gray-600)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'var(--gray-600)', fontWeight:400, fontFamily:"'DM Mono',monospace" }}>SW</div>
          Swipass
        </Link>
        <ul style={{ display:'flex', gap:'2.5rem', listStyle:'none', margin:0, padding:0 }}>
          {['Features','How It Works','Developers','Security','FAQ'].map((item,i) => (
            <li key={i}><a href={`#${item.toLowerCase().replace(' ','-')}`} style={{ fontSize:'0.78rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', transition:'color 0.3s' }}
              onMouseEnter={e=>(e.target as any).style.color='var(--gray-800)'} onMouseLeave={e=>(e.target as any).style.color='var(--gray-500)'}>{item}</a></li>
          ))}
        </ul>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/docs" className="sw-btn sw-btn-ghost">For Developers</Link>
          <Link to="/app" className="sw-btn sw-btn-primary">Launch App</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem', position:'relative', zIndex:1 }}>
        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.85rem', fontWeight:500, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--gray-500)', animation:'fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards', opacity:0 }}>
          Speak. Swipe. Settle.
        </p>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:'1px solid var(--gray-300)', borderBottom:'1px solid var(--gray-300)', padding:'1.1rem 0', overflow:'hidden', background:'var(--gray-100)', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', gap:'4rem', animation:'marquee 28s linear infinite', whiteSpace:'nowrap' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem', fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-500)', flexShrink:0, fontFamily:"'DM Mono',monospace" }}>
              <div style={{ width:3, height:3, background:'var(--gray-400)', borderRadius:'50%' }} />
              {item}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding:'8rem 2rem', maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'end', marginBottom:'5rem' }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Core Capabilities</div>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4.5vw,3.5rem)', fontWeight:700, lineHeight:1.05, letterSpacing:'-0.03em', color:'var(--gray-900)' }}>
              Everything needed to<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>move value</span>
            </h2>
          </div>
          <p className="reveal reveal-delay-2" style={{ color:'var(--gray-500)', fontSize:'0.95rem', lineHeight:1.75 }}>Swipass abstracts bridge interfaces, token selection, and chain switching. From wallet connect, every operation reduces to a single sentence.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--gray-300)', border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
          {[
            { title:'Voice-First Interface', desc:'Speak or type commands. Vosk transcribes audio locally — your voice never leaves your device. Intent parsing via LLM extracts chain, token, and amount.', icon:'🎤' },
            { title:'Cross-Chain Execution', desc:'All major EVM chains via integrated providers. Send to a different address on the destination chain — signed once from your wallet.', icon:'⛓️' },
            { title:'Intelligent Routing', desc:'All providers queried concurrently. Weighted scoring on output amount, speed, and historical success rate selects optimal route automatically.', icon:'🎯' },
            { title:'Developer API', desc:'REST API for integrating cross-chain execution into any application. BYO-LLM keys — pass your own OpenAI or Anthropic credentials per request.', icon:'</>' },
            { title:'Revenue Sharing', desc:'Earn 50% of every transaction fee your users generate. Withdrawals to any EVM wallet once $50 threshold is reached.', icon:'💰' },
            { title:'Non-Custodial & Secure', desc:'Swipass never holds funds. Rate limiting, transaction simulation, and admin circuit breakers protect against abuse. Keys stored hashed.', icon:'🛡️' },
          ].map((f, i) => (
            <div key={i} className="feature-card reveal" style={{ background:'var(--gray-100)', padding:'2.5rem 2rem', transition:'background 0.35s', position:'relative', overflow:'hidden', cursor:'default' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-200)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-100)'}>
              <div style={{ width:44, height:44, border:'1px solid var(--gray-400)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem', fontSize:'1.2rem' }}>{f.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.05rem', fontWeight:600, color:'var(--gray-900)', marginBottom:'0.6rem' }}>{f.title}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--gray-500)', lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Process</div>
          <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4.5vw,3.5rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', lineHeight:1.05 }}>
            Three steps.<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>Zero friction.</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', marginTop:'5rem', position:'relative' }}>
            <div style={{ position:'absolute', top:'2.5rem', left:'calc(16.66% + 1rem)', right:'calc(16.66% + 1rem)', height:1, background:'linear-gradient(to right, transparent, var(--gray-400), var(--gray-400), transparent)' }} />
            {[
              { n:'01', word:'Speak', desc:'Connect your wallet and say what you need. "Send 50 USDC from Arbitrum to Base" — or type it. No account, no KYC.' },
              { n:'02', word:'Swipe', desc:'Review the optimal quote from our provider network. Lowest cost, fastest, highest reliability. Confirm with a single wallet signature.' },
              { n:'03', word:'Settle', desc:'Swipass handles the rest. Bridging, routing, and settlement happen automatically. Assets arrive at the destination address.' },
            ].map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i+1}`} style={{ padding:'0 2rem' }}>
                <div style={{ width:48, height:48, border:'1px solid var(--gray-400)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'var(--gray-600)', marginBottom:'2rem', background:'var(--gray-50)', position:'relative', zIndex:1 }}>{s.n}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', fontWeight:700, color:'var(--gray-700)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>{s.word}</div>
                <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', lineHeight:1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO / TERMINAL */}
      <section style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', background:'var(--gray-100)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6rem', alignItems:'center' }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Live Example</div>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', marginBottom:'1.5rem', lineHeight:1.05 }}>
              Natural language,<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>real execution</span>
            </h2>
            <p className="reveal reveal-delay-2" style={{ color:'var(--gray-500)', fontSize:'0.88rem', lineHeight:1.8, marginBottom:'2.5rem' }}>The intent engine understands free-form commands and normalizes them into structured on-chain operations.</p>
            <div className="reveal reveal-delay-3" style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
              {['"Bridge 1 ETH to Polygon"','"Swap USDC for WETH on Arb"','"Send 200 DAI to Base"','"Move all USDT to mainnet"'].map((c,i) => (
                <span key={i} className="sw-chip" style={{ display:'inline-block', padding:'0.4rem 0.85rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:40, fontSize:'0.75rem', color:'var(--gray-600)', cursor:'none' }}>{c}</span>
              ))}
            </div>
          </div>
          <div className="reveal reveal-delay-2"><Terminal /></div>
        </div>
      </section>

      {/* STATS BAR — REAL DATA */}
      <div style={{ padding:'4rem 2rem', borderTop:'1px solid var(--gray-300)', borderBottom:'1px solid var(--gray-300)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2rem' }}>
          {[
            { val: stats?.total_chains_supported ?? 8, suffix:'', label:'Supported Chains', decimals:0 },
            { val: 0.10, suffix:'%', label:'Fee for Direct Users', decimals:2 },
            { val: 50, suffix:'%', label:'Developer Revenue Share', decimals:0 },
            { val: 0, suffix:'', label:'Accounts Required', decimals:0 },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.4rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.04em', lineHeight:1 }}>
                <AnimatedCounter target={s.val} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div style={{ fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>{s.label}</div>
              <div style={{ width:40, height:1, background:'var(--gray-400)', marginTop:'0.5rem' }} />
            </div>
          ))}
        </div>
      </div>

      {/* DEVELOPER */}
      <section id="developers" style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6rem', alignItems:'start' }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Developer Platform</div>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', marginBottom:'1.5rem', lineHeight:1.05 }}>
              Build with intent.<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>Earn on every swap.</span>
            </h2>
            <p className="reveal reveal-delay-2" style={{ color:'var(--gray-500)', fontSize:'0.88rem', lineHeight:1.8, marginBottom:'3rem' }}>Integrate Swipass with a single REST endpoint. Bring your own LLM keys. Every transaction your users execute generates revenue for you.</p>
            <div className="reveal reveal-delay-3" style={{ display:'flex', gap:'0.75rem' }}>
              <Link to="/docs" className="sw-btn sw-btn-primary">View Docs</Link>
              <Link to="/auth" className="sw-btn sw-btn-ghost">Sign Up Free</Link>
            </div>
          </div>
          <div className="reveal reveal-delay-2">
            <div style={{ border:'1px solid var(--gray-300)', borderRadius:10, overflow:'hidden', background:'var(--gray-100)' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>Fee & Revenue Structure</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['User Type','Fee','Your Share'].map(h => <th key={h} style={{ padding:'1rem 1.5rem', textAlign:'left', fontSize:'0.72rem', letterSpacing:'0.06em', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)', fontWeight:400 }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  <tr>{['Direct User','0.10%','—'].map((v,i) => <td key={i} style={{ padding:'1rem 1.5rem', fontSize:'0.8rem', color:'var(--gray-700)', borderBottom:'1px solid var(--gray-200)' }}>{v}</td>)}</tr>
                  <tr>{['Via Developer App','0.15%','0.075% (50%)'].map((v,i) => <td key={i} style={{ padding:'1rem 1.5rem', fontSize:'0.8rem', color:'var(--gray-900)', fontWeight: i===2 ? 600 : 400 }}>{v}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:'1.5rem', border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden', background:'var(--gray-100)' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>Quick Integration</div>
              <pre style={{ padding:'1.5rem', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'var(--gray-600)', lineHeight:1.7, background:'var(--gray-50)', margin:0, overflow:'auto' }}>
{`POST /v1/intent
Headers:
  X-API-Key: sw_live_...
  X-LLM-Provider: openai   # optional
  X-LLM-API-Key: sk-...    # optional
Body:
{
  "command": "Bridge 1 ETH to Polygon",
  "destination_address": "0x..."
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* PROVIDERS */}
      <section style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', background:'var(--gray-100)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'4rem', flexWrap:'wrap', gap:'2rem' }}>
            <div>
              <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Provider Network</div>
              <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', lineHeight:1.05 }}>
                Multi-provider.<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>Always optimal.</span>
              </h2>
            </div>
            <p className="reveal reveal-delay-2" style={{ maxWidth:380, fontSize:'0.85rem', color:'var(--gray-500)', lineHeight:1.75 }}>Swipass queries every enabled provider concurrently. Intelligent scoring on output, speed, and 30-day historical success rate selects the winner. Automatic failover if a provider expires mid-flight.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--gray-300)', border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden', marginBottom:'2rem' }}>
            {[
              { badge:'Active', name:'0x Protocol', desc:'DEX aggregation & cross-chain swaps via Permit2. Production-ready at launch.' },
              { badge:'Active', name:'LI.FI', desc:'Cross-chain DEX aggregation with broad chain coverage.' },
              { badge:'Active', name:'Across Protocol', desc:'Intent-based bridging optimized for speed and capital efficiency.' },
              { badge:'Open', name:'+ New Providers', desc:'Modular provider interface — any new protocol integrates via abstract base class.' },
            ].map((p, i) => (
              <div key={i} className="provider-card reveal" style={{ background:'var(--gray-50)', padding:'2rem 1.5rem', transition:'background 0.3s', cursor:'default' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-200)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-50)'}>
                <div style={{ display:'inline-block', padding:'0.25rem 0.6rem', background:'var(--gray-300)', borderRadius:3, fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'1rem' }}>{p.badge}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:600, color:'var(--gray-800)', marginBottom:'0.4rem' }}>{p.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'2rem', padding:'1.5rem 2rem', border:'1px solid var(--gray-300)', borderRadius:6, background:'var(--gray-50)', flexWrap:'wrap' }}>
            {[{ label:'Output Amount', value:'70%' },{ label:'Speed Weight', value:'20%' },{ label:'Historical Success', value:'10%' },{ label:'Fallback', value:'Auto on failure' }].map((item, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:'0.3rem', ...(i===3 ? { borderLeft:'1px solid var(--gray-300)', paddingLeft:'2rem', marginLeft:'auto' } : {}) }}>
                <div style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-500)' }}>{item.label}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize: i===3?'0.9rem':'1.2rem', fontWeight:700, color:'var(--gray-900)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'5fr 7fr', gap:'6rem', alignItems:'start' }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>Security & Control</div>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', lineHeight:1.05 }}>
              Enterprise-grade<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>failsafes</span>
            </h2>
            <p className="reveal reveal-delay-2" style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.75, marginTop:'1.5rem' }}>Every layer is designed with non-custodial principles. Your keys never leave your wallet. Admin controls ensure operational continuity.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'var(--gray-300)', border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
            {[
              { title:'Global Circuit Breaker', desc:'Super Admin can pause the entire intent system instantly — all requests receive 503.' },
              { title:'Privacy-First Voice', desc:'Vosk runs as WebAssembly. Transcription is entirely local. Only text commands are transmitted.' },
              { title:'API Key Hashing', desc:'All developer keys are bcrypt-hashed before storage. Plain-text shown once at creation.' },
              { title:'Rate Limiting', desc:'Redis-backed: 60 req/min per API key, 20 req/min per IP. Abuse auto-detected.' },
              { title:'Tx Simulation', desc:'Optional pre-flight simulation catches reverts before signing. Prevents failed transactions.' },
              { title:'Role-Based Access', desc:'Support, Finance, Moderator staff roles with granular permissions set by Super Admin.' },
            ].map((s, i) => (
              <div key={i} className="sec-card reveal" style={{ background:'var(--gray-100)', padding:'1.75rem', transition:'background 0.3s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-200)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--gray-100)'}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.95rem', fontWeight:600, color:'var(--gray-800)', marginBottom:'0.4rem' }}>{s.title}</div>
                <p style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:'8rem 2rem', borderTop:'1px solid var(--gray-300)', background:'var(--gray-100)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 2fr', gap:'6rem', alignItems:'start' }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom:'1.5rem' }}>FAQ</div>
            <h2 className="reveal reveal-delay-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--gray-900)', lineHeight:1.05 }}>
              Common<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>questions</span>
            </h2>
          </div>
          <div style={{ borderTop:'1px solid var(--gray-300)' }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ borderBottom:'1px solid var(--gray-300)' }}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width:'100%', background:'none', border:'none', textAlign:'left', padding:'1.25rem 0', fontFamily:"'Syne',sans-serif", fontSize:'0.95rem', fontWeight:600, color: openFaq===i ? 'var(--gray-900)' : 'var(--gray-700)', cursor:'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', transition:'color 0.3s' }}>
                  {f.q}
                  <svg style={{ width:18, height:18, flexShrink:0, color:'var(--gray-500)', transform: openFaq===i ? 'rotate(180deg)' : 'none', transition:'transform 0.3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div style={{ maxHeight: openFaq===i ? 200 : 0, overflow:'hidden', transition:'max-height 0.4s cubic-bezier(0.16,1,0.3,1)', fontSize:'0.83rem', color:'var(--gray-500)', lineHeight:1.8, paddingBottom: openFaq===i ? '1.25rem' : 0 }}>
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'10rem 2rem', borderTop:'1px solid var(--gray-300)', textAlign:'center', position:'relative', overflow:'hidden', zIndex:1 }}>
        <div style={{ position:'absolute', bottom:'-1rem', left:'50%', transform:'translateX(-50%)', fontFamily:"'Syne',sans-serif", fontSize:'18vw', fontWeight:800, color:'var(--gray-200)', whiteSpace:'nowrap', letterSpacing:'-0.05em', pointerEvents:'none', lineHeight:1 }}>Settle.</div>
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
          <h2 className="reveal" style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, color:'var(--gray-900)', marginBottom:'1.5rem' }}>
            Ready to<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, color:'var(--gray-600)' }}>move value?</span>
          </h2>
          <p className="reveal reveal-delay-1" style={{ fontSize:'0.9rem', color:'var(--gray-500)', lineHeight:1.7, marginBottom:'3rem' }}>No account. No complexity. Connect your wallet and issue your first cross-chain command in under 30 seconds.</p>
          <div className="reveal reveal-delay-2" style={{ display:'flex', justifyContent:'center', gap:'1rem', flexWrap:'wrap' }}>
            <Link to="/app" className="sw-btn sw-btn-primary" style={{ fontSize:'0.85rem', padding:'0.9rem 2rem' }}>Launch App — Free</Link>
            <Link to="/docs" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.85rem', padding:'0.9rem 2rem' }}>Developer Docs</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid var(--gray-300)', padding:'3rem 2rem', background:'var(--gray-50)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1.5rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', marginBottom:'0.5rem' }}>
              <div style={{ width:24, height:24, border:'1.5px solid var(--gray-600)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-600)' }}>SWi</div>
              Swipass
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>© {new Date().getFullYear()} Swipass. All rights reserved.</div>
          </div>
          <ul style={{ display:'flex', gap:'2rem', listStyle:'none', margin:0, padding:0 }}>
            {[['Docs','/docs'],['Dashboard','/dashboard'],['GitHub','#'],['Discord','#'],['Privacy','#'],['Terms','#']].map(([label,href]) => (
              <li key={label}><Link to={href} style={{ fontSize:'0.72rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', transition:'color 0.3s' }}
                onMouseEnter={e=>(e.target as any).style.color='var(--gray-800)'} onMouseLeave={e=>(e.target as any).style.color='var(--gray-500)'}>{label}</Link></li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}
