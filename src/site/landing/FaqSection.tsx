// src/site/landing/FaqSection.tsx
import { useState } from 'react'
import { FAQS } from '../../content/faq'
import { Reveal, SectionIntro } from '../ui'

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-[1440px] px-6 py-24 sm:py-32 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionIntro
          kicker="FAQ"
          title={
            <>
              Common <span className="f-serif italic">questions</span>
            </>
          }
          body="Everything people ask before their first command. Anything else is covered in the docs."
        />
        <Reveal delay={120}>
          <ul className="border-t border-white/[0.08]">
            {FAQS.map((faq, i) => {
              const isOpen = open === i
              return (
                <li key={faq.q} className="border-b border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className={`text-[1.05rem] tracking-[-0.01em] transition-colors sm:text-[1.15rem] ${isOpen ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-2)]'}`}>
                      {faq.q}
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.12] text-[color:var(--ink)] transition-transform duration-500 ${isOpen ? 'rotate-45 bg-white/[0.08]' : ''}`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 pr-12 text-[0.92rem] leading-relaxed text-[color:var(--ink-3)]">{faq.a}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
