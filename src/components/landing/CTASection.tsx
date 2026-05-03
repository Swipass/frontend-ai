// src/components/landing/CTASection.tsx
import { Link } from 'react-router-dom'

export function CTASection() {
  return (
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
  )
}