// src/components/landing/SecuritySection.tsx

const securityItems = [
  { title: 'Global Circuit Breaker', desc: 'Super Admin can pause the entire intent system instantly — all requests receive 503.' },
  { title: 'Privacy-First Voice', desc: 'Vosk runs as WebAssembly. Transcription is entirely local. Only text commands are transmitted.' },
  { title: 'API Key Hashing', desc: 'All developer keys are bcrypt-hashed before storage. Plain-text shown once at creation.' },
  { title: 'Rate Limiting', desc: 'Redis-backed: 60 req/min per API key, 20 req/min per IP. Abuse auto-detected.' },
  { title: 'Tx Simulation', desc: 'Optional pre-flight simulation catches reverts before signing. Prevents failed transactions.' },
  { title: 'Role-Based Access', desc: 'Support, Finance, Moderator staff roles with granular permissions set by Super Admin.' },
]

export function SecuritySection() {
  return (
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
          {securityItems.map((s, i) => (
            <div key={i} className="bg-dark-grey-1 p-5 transition-colors hover:bg-dark-grey-2">
              <div className="font-display text-base font-semibold text-light-grey-3 mb-2">{s.title}</div>
              <p className="text-xs text-light-grey-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}