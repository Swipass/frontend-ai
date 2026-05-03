// src/components/landing/FeaturesSection.tsx

const features = [
  { title: 'Voice-First Interface', desc: 'Speak or type commands. Vosk transcribes audio locally — your voice never leaves your device. Intent parsing via LLM extracts chain, token, and amount.', icon: '🎤' },
  { title: 'Cross-Chain Execution', desc: 'All major EVM chains via integrated providers. Send to a different address on the destination chain — signed once from your wallet.', icon: '⛓️' },
  { title: 'Intelligent Routing', desc: 'All providers queried concurrently. Weighted scoring on output amount, speed, and historical success rate selects optimal route automatically.', icon: '🎯' },
  { title: 'Developer API', desc: 'REST API for integrating cross-chain execution into any application. BYO-LLM keys — pass your own OpenAI or Anthropic credentials per request.', icon: '</>' },
  { title: 'Revenue Sharing', desc: 'Earn 50% of every transaction fee your users generate. Withdrawals to any EVM wallet once $50 threshold is reached.', icon: '💰' },
  { title: 'Non-Custodial & Secure', desc: 'Swipass never holds funds. Rate limiting, transaction simulation, and admin circuit breakers protect against abuse. Keys stored hashed.', icon: '🛡️' },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-28 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
        <div>
          <div className="section-label reveal mb-6">Core Capabilities</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight tracking-tighter text-almost-white reveal reveal-delay-1">
            Everything needed to<br /><span className="font-serif italic font-normal text-light-grey-2">move value</span>
          </h2>
        </div>
        <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed reveal reveal-delay-2">
          Swipass abstracts bridge interfaces, token selection, and chain switching. From wallet connect, every operation reduces to a single sentence.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-grey-3 border border-dark-grey-3 rounded-lg overflow-hidden">
        {features.map((f, i) => (
          <div key={i} className="feature-card bg-dark-grey-1 p-6 sm:p-8 transition-colors hover:bg-dark-grey-2 cursor-default">
            <div className="w-11 h-11 border border-mid-grey rounded-lg flex items-center justify-center mb-5 text-xl">{f.icon}</div>
            <div className="font-display text-lg font-semibold text-almost-white mb-2">{f.title}</div>
            <div className="text-light-grey-1 text-sm leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}