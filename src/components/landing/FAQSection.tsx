// src/components/landing/FAQSection.tsx
import { useState } from 'react'
import { FAQS } from '../../content/faq'

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