// src/pages/AdminDashboard/components/Controls.tsx
// Filter controls and small display pieces the admin tables share.
import type { ReactNode } from 'react'
import { selectCls } from '../shared'

export function Select({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
  className?: string
}) {
  return (
    <select aria-label={label} value={value} onChange={e => onChange(e.target.value)} className={`${selectCls} h-9 ${className}`}>
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** A row of filters above a table; wraps on narrow screens. */
export function FilterBar({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {children}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

/** Pretty-printed JSON in the dashboards' code surface. */
export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="f-mono overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-[0.72rem] leading-relaxed text-[color:var(--ink-3)]">
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  )
}

/** A small text button in the table row style. */
export function RowButton({ children, onClick, disabled, title }: { children: ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className="inline-flex h-8 items-center whitespace-nowrap rounded-full border border-white/[0.1] px-3 text-[0.74rem] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.08] hover:text-[color:var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

/** A short note under a disabled control, saying why it is disabled. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[0.76rem] leading-relaxed text-[color:var(--ink-4)]">{children}</p>
}
