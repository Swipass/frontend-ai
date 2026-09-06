// src/pages/AdminDashboard/shared.tsx
// Shared UI primitives for the admin dashboard. Same XOT Grey design language.
import { useState } from 'react'

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

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="dash-card text-center py-12">
      <p className="text-light-grey-2 text-sm font-display">{title}</p>
      {hint && <p className="text-light-grey-1 text-xs mt-2 leading-relaxed max-w-md mx-auto">{hint}</p>}
    </div>
  )
}

export function StatusDot({ ok, live }: { ok: boolean; live?: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? 'bg-light-grey-2' : 'bg-mid-grey'} ${live && ok ? 'animate-pulse' : ''}`}
    />
  )
}

export function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-40 ${on ? 'bg-light-grey-2' : 'bg-mid-grey'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-almost-white transition-transform duration-300 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy,
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
      <div className="w-full max-w-md bg-dark-grey-1 border border-mid-grey rounded-lg p-6" onClick={e => e.stopPropagation()}>
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

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deepest-dark/80" onClick={onClose}>
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto bg-dark-grey-1 border border-mid-grey rounded-lg p-6`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg font-semibold text-almost-white">{title}</div>
          <button onClick={onClose} className="text-light-grey-1 hover:text-light-grey-3" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const inputCls =
  'w-full bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-sm font-mono text-light-grey-3 focus:outline-none focus:border-light-grey-1 placeholder:text-light-grey-1'

export const selectCls =
  'bg-dark-grey-2 border border-mid-grey rounded px-2 py-1 text-xs text-light-grey-2 font-mono focus:outline-none focus:border-light-grey-1'

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
