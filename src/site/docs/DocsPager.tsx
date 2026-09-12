// src/site/docs/DocsPager.tsx
import { ArrowRight } from '../ui'
import type { DocSection } from './DocsSidebar'

type Direction = 'prev' | 'next'

function PagerCard({ section, direction, onGo }: { section: DocSection; direction: Direction; onGo: (id: string) => void }) {
  const next = direction === 'next'
  const arrow = (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.12] text-[color:var(--ink)] transition-transform duration-500 ${
        next ? 'group-hover:translate-x-1' : 'rotate-180 group-hover:-translate-x-1'
      }`}
    >
      <ArrowRight />
    </span>
  )
  return (
    <button
      type="button"
      onClick={() => onGo(section.id)}
      className={`glass group flex items-center gap-4 p-5 transition-colors duration-500 hover:border-white/[0.18] ${
        next ? 'justify-end text-right' : 'text-left'
      }`}
    >
      {!next && arrow}
      <div>
        <div className="kicker">{next ? 'Next' : 'Previous'}</div>
        <div className="mt-1.5 text-[1.05rem] text-[color:var(--ink)]">{section.label}</div>
      </div>
      {next && arrow}
    </button>
  )
}

export function DocsPager({ prev, next, onGo }: { prev: DocSection | null; next: DocSection | null; onGo: (id: string) => void }) {
  return (
    <nav aria-label="Previous and next section" className="mt-14 grid gap-3 border-t border-white/[0.07] pt-8 sm:grid-cols-2">
      {prev ? <PagerCard section={prev} direction="prev" onGo={onGo} /> : <span className="hidden sm:block" />}
      {next ? <PagerCard section={next} direction="next" onGo={onGo} /> : <span />}
    </nav>
  )
}
