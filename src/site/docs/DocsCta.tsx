// src/site/docs/DocsCta.tsx
// The closing panel of the docs, in the landing page's paper style.
import { PillLink } from '../ui'

const INSTALLS = [
  ['JavaScript', 'npm install @swipass/sdk'],
  ['Python', 'pip install swipass'],
]

export function DocsCta() {
  return (
    <section className="px-2 pb-6 pt-16 sm:px-4 lg:px-6">
      <div className="paper mx-auto grid max-w-[1440px] gap-10 rounded-[1.6rem] px-6 py-14 sm:rounded-[2.2rem] sm:px-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <div className="kicker">Start building</div>
          <h2 className="f-serif mt-4 text-[2.2rem] leading-[1.05] text-[color:var(--ink)] sm:text-[3rem]">
            Your first intent is one request away
          </h2>
          <p className="f-mono mt-5 max-w-md text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">
            Create a project, copy its API key, and send a sentence to /v1/intent. Every route comes back scored and
            simulated.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink to="/auth" variant="outline">Get an API key</PillLink>
            <PillLink to="/app" variant="outline">Try the app</PillLink>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {INSTALLS.map(([lang, command]) => (
            <div key={lang} className="rounded-2xl border border-[color:var(--line-2)] bg-[#dcdcdc]/70 px-5 py-4">
              <div className="f-mono text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--ink-4)]">{lang}</div>
              <code className="f-mono mt-1.5 block text-[0.95rem] text-[color:var(--ink)]">$ {command}</code>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
