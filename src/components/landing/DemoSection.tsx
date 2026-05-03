// src/components/landing/DemoSection.tsx
import { useState, useEffect, useRef, useCallback } from 'react'

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
        {[0, 1, 2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-mid-grey" />)}
      </div>
      <div ref={bodyRef} className="p-4 font-mono text-xs sm:text-sm min-h-[240px] max-h-[280px] overflow-y-auto">
        {lines.map((l, i) =>
          l.type === 'spacer' ? (
            <div key={i} className="h-2" />
          ) : (
            <div key={i} className="mb-1 flex gap-2">
              {l.type === 'cmd' && <span className="text-light-grey-1">{'>'}</span>}
              <span className={`${l.type === 'cmd' ? '' : 'pl-4'} ${colorMap[l.type] === '#e5e5e5' ? 'text-almost-white' : colorMap[l.type] === '#666666' ? 'text-light-grey-1' : colorMap[l.type] === '#404040' ? 'text-mid-grey' : 'text-light-grey-3'}`}>{l.text}</span>
            </div>
          )
        )}
        <div className="flex gap-2">
          <span className="text-light-grey-1">{'>'}</span>
          <span className={`inline-block w-1.5 h-3.5 bg-light-grey-1 ${cursor ? 'opacity-100' : 'opacity-0'} align-middle`} />
        </div>
      </div>
    </div>
  )
}

export function DemoSection() {
  return (
    <section className="py-16 md:py-28 px-6 border-t border-dark-grey-3 bg-dark-grey-1 relative z-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="section-label reveal mb-6">Live Example</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
            Natural language,<br /><span className="font-serif italic font-normal text-light-grey-2">real execution</span>
          </h2>
          <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mt-4 mb-6 reveal reveal-delay-2">The intent engine understands free-form commands and normalizes them into structured on-chain operations.</p>
          <div className="flex flex-wrap gap-3 reveal reveal-delay-3">
            {['"Bridge 1 ETH to Polygon"', '"Swap USDC for WETH on Arb"', '"Send 200 DAI to Base"', '"Move all USDT to mainnet"'].map((c, i) => (
              <span key={i} className="inline-block px-3 py-1.5 bg-dark-grey-2 border border-dark-grey-3 rounded-full text-xs text-light-grey-2">{c}</span>
            ))}
          </div>
        </div>
        <div className="reveal reveal-delay-2"><Terminal /></div>
      </div>
    </section>
  )
}