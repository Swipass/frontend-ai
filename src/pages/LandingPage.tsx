// src/pages/LandingPage.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { intentService, SystemStats } from '../services/intentService'

// ─── Three.js WebGL Scene (fixed loading) ─────────────────────
function WebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [threeReady, setThreeReady] = useState(false)

  useEffect(() => {
    // Check if THREE is already loaded
    if ((window as any).THREE) {
      setThreeReady(true)
      return
    }
    // Wait for the script to load
    const script = document.querySelector('script[src*="three.js"]')
    if (script) {
      script.addEventListener('load', () => setThreeReady(true))
    } else {
      // Fallback: create a listener for the dynamically added script
      const observer = new MutationObserver((mutations) => {
        if ((window as any).THREE) {
          setThreeReady(true)
          observer.disconnect()
        }
      })
      observer.observe(document.head, { childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!threeReady) return
    const canvas = canvasRef.current
    if (!canvas) return
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
  }, [threeReady])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
}

// ─── Animated counter (unchanged) ─────────────────────────────
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

// ─── Terminal animation (unchanged) ───────────────────────────
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
    <div className="border border-dark-grey-3 rounded-lg overflow-hidden bg-deepest-dark shadow-2xl">
      <div className="bg-dark-grey-1 px-3 py-2 flex gap-2 border-b border-dark-grey-3">
        {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-mid-grey" />)}
      </div>
      <div ref={bodyRef} className="p-4 font-mono text-xs sm:text-sm min-h-[240px] max-h-[280px] overflow-y-auto">
        {lines.map((l, i) => l.type === 'spacer' ? <div key={i} className="h-2" /> : (
          <div key={i} className="mb-1 flex gap-2">
            {l.type === 'cmd' && <span className="text-light-grey-1">{'>'}</span>}
            <span className={`${l.type === 'cmd' ? '' : 'pl-4'} ${colorMap[l.type] === '#e5e5e5' ? 'text-almost-white' : colorMap[l.type] === '#666666' ? 'text-light-grey-1' : colorMap[l.type] === '#404040' ? 'text-mid-grey' : 'text-light-grey-3'}`}>{l.text}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-light-grey-1">{'>'}</span>
          <span className={`inline-block w-1.5 h-3.5 bg-light-grey-1 ${cursor ? 'opacity-100' : 'opacity-0'} align-middle`} />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Load Three.js only once
    if (!(window as any).THREE) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.async = true
      document.head.appendChild(script)
    }

    // Fetch real stats
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
    <div className="bg-deepest-dark min-h-screen relative">
      <WebGLScene />

      {/* Navigation – ensure high z-index and pointer events */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between border-b border-transparent transition-all duration-300 nav-scrolled">
        <style>{`.nav-scrolled.scrolled { background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-color: var(--gray-300) !important; padding: 1rem 2rem !important; }`}</style>
        <Link to="/" className="flex items-center gap-2 font-display text-xl sm:text-2xl font-extrabold text-almost-white tracking-tighter">
          Swipass
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex gap-6 lg:gap-8">
          {['Features','How It Works','Developers','Security','FAQ'].map((item,i) => (
            <li key={i}><a href={`#${item.toLowerCase().replace(' ','-')}`} className="text-xs lg:text-sm uppercase tracking-wide text-light-grey-1 hover:text-light-grey-3 transition-colors">{item}</a></li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden md:flex gap-3">
          <Link to="/docs" className="sw-btn sw-btn-ghost">For Developers</Link>
          <Link to="/app" className="sw-btn sw-btn-primary">Launch App</Link>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-almost-white w-8 h-8 flex items-center justify-center border border-dark-grey-3 rounded">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 bg-dark-grey-1 border-b border-dark-grey-3 p-4 md:hidden">
          <ul className="flex flex-col gap-3 mb-4">
            {['Features','How It Works','Developers','Security','FAQ'].map((item,i) => (
              <li key={i}><a href={`#${item.toLowerCase().replace(' ','-')}`} className="block py-2 text-sm uppercase tracking-wide text-light-grey-1" onClick={() => setMobileMenuOpen(false)}>{item}</a></li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Link to="/docs" className="sw-btn sw-btn-ghost w-full justify-center" onClick={() => setMobileMenuOpen(false)}>For Developers</Link>
            <Link to="/app" className="sw-btn sw-btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Launch App</Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 relative z-10">
        <p className="font-display text-xs xs:text-sm tracking-[0.3em] uppercase text-light-grey-1 animate-fadeUp">Speak. Swipe. Settle.</p>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .animate-fadeUp { animation: fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }`}</style>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-dark-grey-3 py-3 bg-dark-grey-1 relative z-10 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs uppercase tracking-wider text-light-grey-1 font-mono flex-shrink-0">
              <div className="w-1 h-1 bg-mid-grey rounded-full" />
              {item}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } .animate-marquee { animation: marquee 28s linear infinite; }`}</style>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-28 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
          <div>
            <div className="section-label reveal mb-6">Core Capabilities</div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight tracking-tighter text-almost-white reveal reveal-delay-1">
              Everything needed to<br /><span className="font-serif italic font-normal text-light-grey-2">move value</span>
            </h2>
          </div>
          <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed reveal reveal-delay-2">Swipass abstracts bridge interfaces, token selection, and chain switching. From wallet connect, every operation reduces to a single sentence.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-grey-3 border border-dark-grey-3 rounded-lg overflow-hidden">
          {[
            { title:'Voice-First Interface', desc:'Speak or type commands. Vosk transcribes audio locally — your voice never leaves your device. Intent parsing via LLM extracts chain, token, and amount.', icon:'🎤' },
            { title:'Cross-Chain Execution', desc:'All major EVM chains via integrated providers. Send to a different address on the destination chain — signed once from your wallet.', icon:'⛓️' },
            { title:'Intelligent Routing', desc:'All providers queried concurrently. Weighted scoring on output amount, speed, and historical success rate selects optimal route automatically.', icon:'🎯' },
            { title:'Developer API', desc:'REST API for integrating cross-chain execution into any application. BYO-LLM keys — pass your own OpenAI or Anthropic credentials per request.', icon:'</>' },
            { title:'Revenue Sharing', desc:'Earn 50% of every transaction fee your users generate. Withdrawals to any EVM wallet once $50 threshold is reached.', icon:'💰' },
            { title:'Non-Custodial & Secure', desc:'Swipass never holds funds. Rate limiting, transaction simulation, and admin circuit breakers protect against abuse. Keys stored hashed.', icon:'🛡️' },
          ].map((f, i) => (
            <div key={i} className="feature-card bg-dark-grey-1 p-6 sm:p-8 transition-colors hover:bg-dark-grey-2 cursor-default">
              <div className="w-11 h-11 border border-mid-grey rounded-lg flex items-center justify-center mb-5 text-xl">{f.icon}</div>
              <div className="font-display text-lg font-semibold text-almost-white mb-2">{f.title}</div>
              <div className="text-light-grey-1 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="section-label reveal mb-6">Process</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
            Three steps.<br /><span className="font-serif italic font-normal text-light-grey-2">Zero friction.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12 mt-12 relative">
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-mid-grey to-transparent" />
            {[
              { n:'01', word:'Speak', desc:'Connect your wallet and say what you need. "Send 50 USDC from Arbitrum to Base" — or type it. No account, no KYC.' },
              { n:'02', word:'Swipe', desc:'Review the optimal quote from our provider network. Lowest cost, fastest, highest reliability. Confirm with a single wallet signature.' },
              { n:'03', word:'Settle', desc:'Swipass handles the rest. Bridging, routing, and settlement happen automatically. Assets arrive at the destination address.' },
            ].map((s, i) => (
              <div key={i} className={`text-center md:text-left reveal reveal-delay-${i+1}`}>
                <div className="w-12 h-12 mx-auto md:mx-0 border border-mid-grey rounded-full flex items-center justify-center font-mono text-sm text-light-grey-2 bg-deepest-dark relative z-10 mb-6">{s.n}</div>
                <div className="font-display text-2xl md:text-3xl font-bold text-light-grey-3 mb-3">{s.word}</div>
                <p className="text-light-grey-1 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO / TERMINAL */}
      <section className="py-16 md:py-28 px-6 border-t border-dark-grey-3 bg-dark-grey-1 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="section-label reveal mb-6">Live Example</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
              Natural language,<br /><span className="font-serif italic font-normal text-light-grey-2">real execution</span>
            </h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mt-4 mb-6 reveal reveal-delay-2">The intent engine understands free-form commands and normalizes them into structured on-chain operations.</p>
            <div className="flex flex-wrap gap-3 reveal reveal-delay-3">
              {['"Bridge 1 ETH to Polygon"','"Swap USDC for WETH on Arb"','"Send 200 DAI to Base"','"Move all USDT to mainnet"'].map((c,i) => (
                <span key={i} className="inline-block px-3 py-1.5 bg-dark-grey-2 border border-dark-grey-3 rounded-full text-xs text-light-grey-2">{c}</span>
              ))}
            </div>
          </div>
          <div className="reveal reveal-delay-2"><Terminal /></div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="py-10 md:py-14 px-6 border-y border-dark-grey-3 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center md:text-left">
          {[
            { val: stats?.total_chains_supported ?? 8, suffix:'', label:'Supported Chains', decimals:0 },
            { val: 0.10, suffix:'%', label:'Fee for Direct Users', decimals:2 },
            { val: 50, suffix:'%', label:'Developer Revenue Share', decimals:0 },
            { val: 0, suffix:'', label:'Accounts Required', decimals:0 },
          ].map((s, i) => (
            <div key={i} className="reveal">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-almost-white tracking-tighter">
                <AnimatedCounter target={s.val} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="text-xs uppercase tracking-wider text-light-grey-1 mt-1">{s.label}</div>
              <div className="w-10 h-px bg-mid-grey mt-3 mx-auto md:mx-0" />
            </div>
          ))}
        </div>
      </div>

      {/* DEVELOPER */}
      <section id="developers" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-label reveal mb-6">Developer Platform</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
              Build with intent.<br /><span className="font-serif italic font-normal text-light-grey-2">Earn on every swap.</span>
            </h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed my-6 reveal reveal-delay-2">Integrate Swipass with a single REST endpoint. Bring your own LLM keys. Every transaction your users execute generates revenue for you.</p>
            <div className="flex gap-4 reveal reveal-delay-3">
              <Link to="/docs" className="sw-btn sw-btn-primary">View Docs</Link>
              <Link to="/auth" className="sw-btn sw-btn-ghost">Sign Up Free</Link>
            </div>
          </div>
          <div className="reveal reveal-delay-2">
            <div className="border border-dark-grey-3 rounded-xl overflow-hidden bg-dark-grey-1">
              <div className="px-4 py-3 border-b border-dark-grey-3 text-xs uppercase tracking-wide text-light-grey-1">Fee & Revenue Structure</div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-light-grey-1 border-b border-dark-grey-3">
                    <th className="p-4 font-normal">User Type</th><th className="p-4 font-normal">Fee</th><th className="p-4 font-normal">Your Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark-grey-2"><td className="p-4 text-sm text-light-grey-3">Direct User</td><td className="p-4 text-sm text-light-grey-3">0.10%</td><td className="p-4 text-sm text-light-grey-3">—</td></tr>
                  <tr><td className="p-4 text-sm text-almost-white font-medium">Via Developer App</td><td className="p-4 text-sm text-almost-white">0.15%</td><td className="p-4 text-sm text-almost-white font-semibold">0.075% (50%)</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 border border-dark-grey-3 rounded-xl overflow-hidden bg-dark-grey-1">
              <div className="px-4 py-3 border-b border-dark-grey-3 text-xs uppercase tracking-wide text-light-grey-1">Quick Integration</div>
              <pre className="p-4 font-mono text-xs text-light-grey-2 leading-relaxed bg-deepest-dark overflow-auto">
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
      <section className="py-16 md:py-28 px-6 border-t border-dark-grey-3 bg-dark-grey-1 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <div className="section-label reveal mb-6">Provider Network</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
                Multi-provider.<br /><span className="font-serif italic font-normal text-light-grey-2">Always optimal.</span>
              </h2>
            </div>
            <p className="max-w-md text-light-grey-1 text-sm leading-relaxed reveal reveal-delay-2">Swipass queries every enabled provider concurrently. Intelligent scoring on output, speed, and 30-day historical success rate selects the winner. Automatic failover if a provider expires mid-flight.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-dark-grey-3 border border-dark-grey-3 rounded-lg overflow-hidden mb-8">
            {[
              { badge:'Active', name:'0x Protocol', desc:'DEX aggregation & cross-chain swaps via Permit2. Production-ready at launch.' },
              { badge:'Active', name:'LI.FI', desc:'Cross-chain DEX aggregation with broad chain coverage.' },
              { badge:'Active', name:'Across Protocol', desc:'Intent-based bridging optimized for speed and capital efficiency.' },
              { badge:'Open', name:'+ New Providers', desc:'Modular provider interface — any new protocol integrates via abstract base class.' },
            ].map((p, i) => (
              <div key={i} className="bg-deepest-dark p-6 transition-colors hover:bg-dark-grey-2 cursor-default">
                <div className="inline-block px-2 py-0.5 bg-dark-grey-3 rounded text-xs uppercase tracking-wider text-light-grey-1 mb-4">{p.badge}</div>
                <div className="font-display text-lg font-semibold text-light-grey-3 mb-2">{p.name}</div>
                <div className="text-xs text-light-grey-1 leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 p-5 border border-dark-grey-3 rounded-lg bg-deepest-dark">
            {[{ label:'Output Amount', value:'70%' },{ label:'Speed Weight', value:'20%' },{ label:'Historical Success', value:'10%' },{ label:'Fallback', value:'Auto on failure' }].map((item, i) => (
              <div key={i} className={`flex flex-col gap-1 ${i===3 ? 'md:ml-auto md:pl-6 md:border-l md:border-dark-grey-3' : ''}`}>
                <div className="text-xs uppercase tracking-wider text-light-grey-1">{item.label}</div>
                <div className="font-display text-xl md:text-2xl font-bold text-almost-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-label reveal mb-6">Security & Control</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
              Enterprise-grade<br /><span className="font-serif italic font-normal text-light-grey-2">failsafes</span>
            </h2>
            <p className="text-light-grey-1 text-sm leading-relaxed mt-6 reveal reveal-delay-2">Every layer is designed with non-custodial principles. Your keys never leave your wallet. Admin controls ensure operational continuity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-dark-grey-3 border border-dark-grey-3 rounded-lg overflow-hidden">
            {[
              { title:'Global Circuit Breaker', desc:'Super Admin can pause the entire intent system instantly — all requests receive 503.' },
              { title:'Privacy-First Voice', desc:'Vosk runs as WebAssembly. Transcription is entirely local. Only text commands are transmitted.' },
              { title:'API Key Hashing', desc:'All developer keys are bcrypt-hashed before storage. Plain-text shown once at creation.' },
              { title:'Rate Limiting', desc:'Redis-backed: 60 req/min per API key, 20 req/min per IP. Abuse auto-detected.' },
              { title:'Tx Simulation', desc:'Optional pre-flight simulation catches reverts before signing. Prevents failed transactions.' },
              { title:'Role-Based Access', desc:'Support, Finance, Moderator staff roles with granular permissions set by Super Admin.' },
            ].map((s, i) => (
              <div key={i} className="bg-dark-grey-1 p-5 transition-colors hover:bg-dark-grey-2">
                <div className="font-display text-base font-semibold text-light-grey-3 mb-2">{s.title}</div>
                <p className="text-xs text-light-grey-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 bg-dark-grey-1 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <div className="section-label reveal mb-6">FAQ</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
              Common<br /><span className="font-serif italic font-normal text-light-grey-2">questions</span>
            </h2>
          </div>
          <div className="md:col-span-2 border-t border-dark-grey-3">
            {FAQS.map((f, i) => (
              <div key={i} className="border-b border-dark-grey-3">
                <button className="faq-btn w-full text-left py-4 flex justify-between items-center gap-4 font-display text-sm sm:text-base font-semibold text-light-grey-3 hover:text-almost-white transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <svg className={`w-4 h-4 flex-shrink-0 text-light-grey-1 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                  <p className="text-sm text-light-grey-1 leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-6 border-t border-dark-grey-3 text-center relative overflow-hidden z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-display text-[18vw] font-extrabold text-dark-grey-2 whitespace-nowrap tracking-tighter pointer-events-none">Settle.</div>
        <div className="max-w-2xl mx-auto relative z-20">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter text-almost-white leading-tight reveal">
            Ready to<br /><span className="font-serif italic font-normal text-light-grey-2">move value?</span>
          </h2>
          <p className="text-light-grey-1 text-sm md:text-base leading-relaxed mt-6 mb-8 reveal reveal-delay-1">No account. No complexity. Connect your wallet and issue your first cross-chain command in under 30 seconds.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 reveal reveal-delay-2">
            <Link to="/app" className="sw-btn sw-btn-primary text-sm md:text-base px-6 py-3">Launch App — Free</Link>
            <Link to="/docs" className="sw-btn sw-btn-ghost text-sm md:text-base px-6 py-3">Developer Docs</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-dark-grey-3 py-8 md:py-12 px-6 bg-deepest-dark relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-almost-white mb-2">
              Swipass
            </div>
            <div className="text-xs text-light-grey-1">© {new Date().getFullYear()} Swipass. All rights reserved.</div>
          </div>
          <ul className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wide text-light-grey-1">
            {[['Docs','/docs'],['Dashboard','/dashboard'],['GitHub','#'],['Discord','#'],['Privacy','#'],['Terms','#']].map(([label,href]) => (
              <li key={label}><Link to={href} className="hover:text-light-grey-3 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}