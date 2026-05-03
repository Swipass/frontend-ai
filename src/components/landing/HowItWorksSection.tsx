// src/components/landing/HowItWorksSection.tsx

const steps = [
  { n: '01', word: 'Speak', desc: 'Connect your wallet and say what you need. "Send 50 USDC from Arbitrum to Base" — or type it. No account, no KYC.' },
  { n: '02', word: 'Swipe', desc: 'Review the optimal quote from our provider network. Lowest cost, fastest, highest reliability. Confirm with a single wallet signature.' },
  { n: '03', word: 'Settle', desc: 'Swipass handles the rest. Bridging, routing, and settlement happen automatically. Assets arrive at the destination address.' },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="section-label reveal mb-6">Process</div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
          Three steps.<br /><span className="font-serif italic font-normal text-light-grey-2">Zero friction.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-12 mt-12 relative">
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-mid-grey to-transparent" />
          {steps.map((s, i) => (
            <div key={i} className={`text-center md:text-left reveal reveal-delay-${i + 1}`}>
              <div className="w-12 h-12 mx-auto md:mx-0 border border-mid-grey rounded-full flex items-center justify-center font-mono text-sm text-light-grey-2 bg-deepest-dark relative z-10 mb-6">{s.n}</div>
              <div className="font-display text-2xl md:text-3xl font-bold text-light-grey-3 mb-3">{s.word}</div>
              <p className="text-light-grey-1 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}