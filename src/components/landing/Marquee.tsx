// src/components/landing/Marquee.tsx

const MARQUEE_ITEMS = [
  'Voice-First DeFi', '50+ Chains', 'No Account Required', 'Intelligent Routing',
  '50% Revenue Share', 'BYO-LLM', 'Non-Custodial', 'WebAssembly Transcription',
  'Multi-Provider', 'Performance Scoring', 'Instant Failover', 'PWA Ready',
]

export function Marquee() {
  return (
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
  )
}