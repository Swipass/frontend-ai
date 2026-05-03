// src/components/landing/FAQSection.tsx
import { useState } from 'react'

const FAQS = [
  { q: 'Do I need to create an account?', a: 'No. Anyone can visit Swipass, connect a wallet, and start issuing commands immediately. No email, no sign-up. Only developers and admins need an account.' },
  { q: 'How does Swipass pick the best route?', a: 'All enabled providers are queried simultaneously. Each quote is scored: 70% output amount, 20% speed, 10% historical success rate over the past 30 days.' },
  { q: 'Is my voice data stored?', a: 'Never. Transcription runs in WebAssembly locally in your browser. Only the resulting text command is sent to our servers.' },
  { q: 'What if a provider fails?', a: 'Swipass automatically falls back to the next best provider from the original quote set without interrupting your experience.' },
  { q: 'How do I earn as a developer?', a: 'Integrate the /v1/intent endpoint with your API key. Every transaction your users execute generates 0.075% in fees accumulated in your project balance, withdrawable at $50.' },
  { q: 'Can I bring my own LLM?', a: 'Yes. Pass X-LLM-Provider, X-LLM-API-Key, and X-LLM-Model headers per request. Keys are used only for that session and never stored.' },
  { q: 'Does Swipass hold my funds?', a: 'No. Swipass is fully non-custodial. You always sign transactions from your own wallet. No private keys are ever requested.' },
]

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
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
              <button
                className="faq-btn w-full text-left py-4 flex justify-between items-center gap-4 font-display text-sm sm:text-base font-semibold text-light-grey-3 hover:text-almost-white transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {f.q}
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-light-grey-1 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-light-grey-1 leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}