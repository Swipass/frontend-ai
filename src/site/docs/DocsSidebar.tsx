// src/site/docs/DocsSidebar.tsx
// Numbered section navigation with a progress rail. Sticky beside the article
// on desktop; a sheet that slides in on mobile.
import { PillLink } from '../ui'

export interface DocSection {
  id: string
  label: string
}

export function DocsSidebar({
  sections,
  active,
  open,
  onSelect,
  onClose,
}: {
  sections: DocSection[]
  active: string
  open: boolean
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const index = Math.max(0, sections.findIndex((section) => section.id === active))
  const progress = (index + 1) / sections.length

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[18rem] overflow-y-auto border-r border-white/[0.06] bg-[#0b0b0b] px-3 pb-10 pt-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:sticky md:top-[4.5rem] md:z-auto md:h-[calc(100vh-4.5rem)] md:w-64 md:shrink-0 md:translate-x-0 md:border-r-0 md:bg-transparent md:pt-8 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-5 flex items-center justify-between px-3 md:hidden">
          <span className="kicker">Sections</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sections"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="kicker hidden px-3 pb-4 md:block">Documentation</div>

        <nav aria-label="Documentation sections" className="relative">
          <span className="absolute bottom-3 left-[1.375rem] top-3 w-px bg-white/[0.08]" aria-hidden="true" />
          <span
            className="absolute left-[1.375rem] top-3 w-px bg-[color:var(--ink)] transition-[height] duration-700"
            style={{ height: `calc(${progress} * (100% - 1.5rem))` }}
            aria-hidden="true"
          />
          {sections.map((section, i) => {
            const current = section.id === active
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={current ? 'page' : undefined}
                className={`relative flex w-full items-center gap-3 rounded-full py-2 pl-3 pr-3 text-left text-[0.88rem] transition-all duration-300 ${
                  current
                    ? 'bg-white/[0.07] text-[color:var(--ink)]'
                    : 'text-[color:var(--ink-3)] hover:bg-white/[0.04] hover:text-[color:var(--ink)]'
                }`}
              >
                <span
                  className={`f-mono relative grid h-5 w-5 shrink-0 place-items-center rounded-full border bg-[#0a0a0a] text-[0.55rem] transition-colors duration-500 ${
                    i <= index ? 'border-[color:var(--ink)] text-[color:var(--ink)]' : 'border-white/15 text-[color:var(--ink-4)]'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.label}
              </button>
            )
          })}
        </nav>

        <div className="glass relative mt-8 p-5">
          <div className="kicker">Build with Swipass</div>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[color:var(--ink-3)]">
            Create a project and an API key in the developer dashboard.
          </p>
          <PillLink to="/auth" arrow className="mt-4 h-10 w-full text-[0.8rem]">
            Get an API key
          </PillLink>
        </div>
      </aside>
    </>
  )
}
