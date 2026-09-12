// src/components/app/StatusBanner.tsx
// A slim notice at the top of the app when Swipass is paused, a kind of route
// is switched off, or operations posted a message. Reads the public /v1/status
// on load and every minute. It sits in the page flow, so it never covers the
// command card or the wallet, and it renders nothing when all is normal or the
// status cannot be read.
import { useEffect, useState } from 'react'
import { intentService, type PlatformStatus } from '../../services/intentService'
import { Icon } from './shared'

const REFRESH_MS = 60_000

function describe(s: PlatformStatus) {
  // The app is direct traffic, so direct being off pauses it for this user.
  const paused = s.paused || s.direct === false
  const notes: string[] = []
  if (!paused && s.bridging === false) notes.push('Cross-chain routes are off for now.')
  if (!paused && s.swaps === false) notes.push('Same-chain swaps are off for now.')
  const message = s.message?.trim() || null
  return { paused, notes, message, visible: paused || !!message || notes.length > 0 }
}

export function StatusBanner({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<PlatformStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      if (document.hidden) return
      intentService
        .getStatus()
        .then(s => {
          if (!cancelled) setStatus(s)
        })
        // Keep the last status we actually read; an unreachable endpoint is not
        // a reason to show or hide anything new.
        .catch(() => {})
    }
    load()
    const timer = window.setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  if (!status) return null
  const { paused, notes, message, visible } = describe(status)
  if (!visible) return null

  return (
    <div role="status" aria-live="polite" className={`relative z-[2] ${className}`}>
      <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.12] bg-[#111111]/85 px-3.5 py-2 backdrop-blur-xl">
        <span className="mt-[3px] shrink-0 text-[color:var(--ink)]" aria-hidden="true">
          <Icon.Warning size={13} />
        </span>
        <p className="min-w-0 text-[0.8rem] leading-snug text-[color:var(--ink-2)]">
          <span className="f-mono mr-2 text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--ink-4)]">
            {paused ? 'Paused' : 'Notice'}
          </span>
          {paused && <span className="text-[color:var(--ink)]">Swipass is paused for maintenance. </span>}
          {message && <span>{message} </span>}
          {notes.join(' ')}
        </p>
      </div>
    </div>
  )
}
