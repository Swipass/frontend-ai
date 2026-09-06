// src/pages/DeveloperDashboard/shared.tsx
// Shared UI primitives for the developer dashboard. Kept design-language
// consistent with the XOT Grey palette and Syne / DM Mono type.
import { useState } from 'react'

export function fmtUsd(n: number | undefined | null, dp = 2): string {
  const v = Number(n || 0)
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}

export function fmtNum(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString()
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter">{title}</h1>
        {subtitle && <p className="text-light-grey-1 text-sm mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="dash-card">
      <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">{label}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter">{value}</div>
      {hint && <div className="text-xs text-light-grey-1 mt-1">{hint}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-light-grey-1 text-sm py-8">
      <span className="w-4 h-4 border-2 border-mid-grey border-t-almost-white rounded-full animate-spin" />
      {label}
    </div>
  )
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="dash-card text-center py-12">
      <p className="text-light-grey-2 text-sm font-display">{title}</p>
      {hint && <p className="text-light-grey-1 text-xs mt-2 leading-relaxed max-w-md mx-auto">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="sw-btn sw-btn-ghost text-xs py-1.5 px-3"
    >
      {copied ? 'Copied' : label}
    </button>
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
  message: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deepest-dark/80" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-dark-grey-1 border border-mid-grey rounded-lg p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="font-display text-lg font-semibold text-almost-white mb-2">{title}</div>
        <div className="text-sm text-light-grey-1 leading-relaxed mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="sw-btn sw-btn-ghost text-xs py-2 px-4">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="text-xs uppercase tracking-wider py-2 px-4 rounded border border-mid-grey text-almost-white hover:bg-dark-grey-3 transition disabled:opacity-50"
          >
            {busy ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-light-grey-1 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-light-grey-1 mt-1">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-sm font-mono text-light-grey-3 focus:outline-none focus:border-light-grey-1 placeholder:text-light-grey-1'

// Grey chart palette, aligned to the XOT scale.
export const CHART = {
  grid: '#2a2a2a',
  axis: '#666666',
  series: ['#f5f5f5', '#a3a3a3', '#666666', '#404040'],
  fill: '#a3a3a3',
}

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-dark-grey-1 border border-mid-grey rounded px-3 py-2 text-xs font-mono">
      {label && <div className="text-light-grey-1 mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-light-grey-3">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  )
}
