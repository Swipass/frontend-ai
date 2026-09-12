// src/pages/DeveloperDashboard/components/RevealedKey.tsx
// A secret shown exactly once, right after it is issued.
import { CopyButton } from '../shared'

export function RevealedKey({ name, secret, onDone }: { name: string; secret: string; onDone: () => void }) {
  return (
    <div role="alert" className="dash-card mb-5 border-white/25">
      <div className="kicker mb-3">API key for {name}, shown once only</div>
      <code className="f-mono mb-4 block break-all text-[0.9rem] text-[color:var(--ink)]">{secret}</code>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={secret} label="Copy key" />
        <button type="button" onClick={onDone} className="rounded-full px-3 py-1.5 text-[0.78rem] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">
          I have saved it
        </button>
      </div>
    </div>
  )
}
