// src/site/dashboard/primitives.tsx
// Building blocks shared by the developer and admin dashboards, in the site's
// language. Each dashboard's shared.tsx re-exports these, so pages keep their
// imports and every panel draws from one set.
import { useState, type ReactNode } from 'react'

export function fmtUsd(n: number | undefined | null, dp = 2): string {
  const v = Number(n || 0)
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}

export function fmtNum(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString()
}

export function pct(n: number | undefined | null): string {
  const v = Number(n || 0)
  return `${(v <= 1 ? v * 100 : v).toFixed(1)}%`
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[2rem] font-light leading-[1.05] tracking-[-0.04em] text-[color:var(--ink)] sm:text-[2.5rem]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-[color:var(--ink-3)]">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="dash-card">
      <div className="kicker">{label}</div>
      <div className="mt-4 text-[1.9rem] font-light leading-none tracking-[-0.045em] text-[color:var(--ink)] sm:text-[2.3rem]">
        {value}
      </div>
      {hint && <div className="mt-2 text-[0.76rem] text-[color:var(--ink-4)]">{hint}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-[0.9rem] text-[color:var(--ink-3)]">
      <span className="relative h-5 w-5" aria-hidden="true">
        <span className="absolute inset-0 animate-spin rounded-full border border-white/10 border-t-white/80" />
      </span>
      {label}
    </div>
  )
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="dash-card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04]" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ink)] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </span>
      <p className="text-[1.05rem] text-[color:var(--ink)]">{title}</p>
      {hint && <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[color:var(--ink-3)]">{hint}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex h-8 items-center rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 text-[0.76rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.1] hover:text-[color:var(--ink)]"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

function Overlay({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`dash-rise max-h-[85vh] w-full overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#111111] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)] sm:p-7 ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

// Two-step confirm dialog for dangerous actions. Thin border, never a red fill.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}) {
  if (!open) return null
  return (
    <Overlay onClose={onCancel}>
      <div className="text-[1.35rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{title}</div>
      <div className="mb-7 mt-3 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">{message}</div>
      <div className="flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="pill pill-dark h-10">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="pill pill-light h-10 disabled:opacity-50">
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Overlay>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <Overlay onClose={onClose} wide={wide}>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-[1.35rem] font-light tracking-[-0.03em] text-[color:var(--ink)]">{title}</div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {children}
    </Overlay>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="kicker mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.76rem] text-[color:var(--ink-4)]">{hint}</span>}
    </label>
  )
}

export function StatusDot({ ok, live }: { ok: boolean; live?: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? 'bg-[color:var(--ink)] shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/25'} ${
        live && ok ? 'animate-pulse' : ''
      }`}
    />
  )
}

export function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-40 ${
        on ? 'bg-[color:var(--ink)]' : 'bg-white/15'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full transition-transform duration-300 ${
          on ? 'translate-x-5 bg-[#0a0a0a]' : 'translate-x-0 bg-[color:var(--ink)]'
        }`}
      />
    </button>
  )
}

export const inputCls =
  'w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-4)] focus:border-white/30'

export const selectCls =
  'rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-[color:var(--ink-2)] outline-none transition-colors focus:border-white/30 [&_option]:bg-[#111111]'

// Grey chart palette, aligned to the XOT scale.
export const CHART = {
  grid: 'rgba(255,255,255,0.06)',
  axis: '#737373',
  series: ['#f5f5f5', '#a3a3a3', '#6b6b6b', '#404040'],
  fill: '#d4d4d4',
}

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="f-mono rounded-xl border border-white/[0.1] bg-[#111111]/95 px-3 py-2 text-xs shadow-xl">
      {label && <div className="mb-1 text-[color:var(--ink-4)]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-[color:var(--ink-2)]">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  )
}
