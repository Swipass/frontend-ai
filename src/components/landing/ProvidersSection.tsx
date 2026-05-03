// src/components/landing/ProvidersSection.tsx

const providers = [
  { badge: 'Active', name: '0x Protocol', desc: 'DEX aggregation & cross-chain swaps via Permit2. Production-ready at launch.' },
  { badge: 'Active', name: 'LI.FI', desc: 'Cross-chain DEX aggregation with broad chain coverage.' },
  { badge: 'Active', name: 'Across Protocol', desc: 'Intent-based bridging optimized for speed and capital efficiency.' },
  { badge: 'Open', name: '+ New Providers', desc: 'Modular provider interface — any new protocol integrates via abstract base class.' },
]

const scoringRows = [
  { label: 'Output Amount', value: '70%' },
  { label: 'Speed Weight', value: '20%' },
  { label: 'Historical Success', value: '10%' },
  { label: 'Fallback', value: 'Auto on failure' },
]

export function ProvidersSection() {
  return (
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
          {providers.map((p, i) => (
            <div key={i} className="bg-deepest-dark p-6 transition-colors hover:bg-dark-grey-2 cursor-default">
              <div className="inline-block px-2 py-0.5 bg-dark-grey-3 rounded text-xs uppercase tracking-wider text-light-grey-1 mb-4">{p.badge}</div>
              <div className="font-display text-lg font-semibold text-light-grey-3 mb-2">{p.name}</div>
              <div className="text-xs text-light-grey-1 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 p-5 border border-dark-grey-3 rounded-lg bg-deepest-dark">
          {scoringRows.map((item, i) => (
            <div key={i} className={`flex flex-col gap-1 ${i === 3 ? 'md:ml-auto md:pl-6 md:border-l md:border-dark-grey-3' : ''}`}>
              <div className="text-xs uppercase tracking-wider text-light-grey-1">{item.label}</div>
              <div className="font-display text-xl md:text-2xl font-bold text-almost-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}