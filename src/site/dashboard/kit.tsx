// src/site/dashboard/kit.tsx
// Richer building blocks for the dashboards' data pages: a period switch, KPI
// tiles that compare with the previous period, section cards, tables with
// paging, breakdown bars, badges, alerts and a time series chart. Built on the
// same tokens as primitives.tsx; pages get both through their shared.tsx.
import type { ReactNode } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CHART, ChartTooltip, fmtNum, fmtUsd } from './primitives'

/* ----------------------------------------------------------------- format */

/** "3m ago", "5h ago", "2d ago", or a date for anything older than a month. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '-'
  const then = new Date(iso).getTime()
  if (!isFinite(then)) return '-'
  const s = Math.max(0, Math.round((Date.now() - then) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  if (s < 30 * 86400) return `${Math.round(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

/** 0x1234...abcd */
export function shortAddr(addr?: string | null, head = 6, tail = 4): string {
  if (!addr) return '-'
  return addr.length > head + tail + 3 ? `${addr.slice(0, head)}...${addr.slice(-tail)}` : addr
}

const EXPLORERS: Record<string, string> = {
  ethereum: 'https://etherscan.io',
  arbitrum: 'https://arbiscan.io',
  base: 'https://basescan.org',
  optimism: 'https://optimistic.etherscan.io',
  polygon: 'https://polygonscan.com',
  avalanche: 'https://snowtrace.io',
  bnb: 'https://bscscan.com',
  gnosis: 'https://gnosisscan.io',
}

/** Block explorer link for a transaction, or null for an unknown chain. */
export function explorerTx(chain?: string | null, hash?: string | null): string | null {
  const base = chain ? EXPLORERS[chain] : undefined
  return base && hash ? `${base}/tx/${hash}` : null
}

export function explorerAddress(chain: string | null | undefined, addr?: string | null): string | null {
  const base = EXPLORERS[chain || 'ethereum']
  return base && addr ? `${base}/address/${addr}` : null
}

/** Percent change from previous to current; null when there is nothing to compare. */
export function change(current?: number | null, previous?: number | null): number | null {
  const c = Number(current || 0)
  const p = Number(previous || 0)
  if (!p) return null
  return ((c - p) / p) * 100
}

/* ------------------------------------------------------------ controls */

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.03] p-1">
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`f-mono rounded-full px-3 py-1 text-[0.72rem] transition-colors duration-300 ${
            o.value === value ? 'bg-[color:var(--ink)] text-[#0a0a0a]' : 'text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export const PERIODS = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
]

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ink-4)]" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/[0.1] bg-white/[0.03] py-2 pl-8 pr-3.5 text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-4)] focus:border-white/30"
      />
    </label>
  )
}

/* -------------------------------------------------------------- display */

export function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value == null || !isFinite(value)) return null
  const up = value >= 0
  const good = invert ? !up : up
  return (
    <span
      className={`f-mono inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.66rem] ${
        good ? 'bg-white/[0.08] text-[color:var(--ink)]' : 'border border-white/[0.1] text-[color:var(--ink-3)]'
      }`}
      title="Change against the previous period"
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      {Math.abs(value) >= 1000 ? '999+' : Math.abs(value).toFixed(1)}%
    </span>
  )
}

export function KpiTile({
  label,
  value,
  delta,
  invert,
  hint,
}: {
  label: string
  value: ReactNode
  delta?: number | null
  invert?: boolean
  hint?: string
}) {
  return (
    <div className="dash-card">
      <div className="flex items-start justify-between gap-2">
        <div className="kicker">{label}</div>
        {delta !== undefined && <Delta value={delta} invert={invert} />}
      </div>
      <div className="mt-4 text-[1.7rem] font-light leading-none tracking-[-0.045em] text-[color:var(--ink)] sm:text-[2.05rem]">{value}</div>
      {hint && <div className="mt-2 text-[0.74rem] text-[color:var(--ink-4)]">{hint}</div>}
    </div>
  )
}

export function Section({
  title,
  subtitle,
  right,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`dash-card ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.02rem] text-[color:var(--ink)]">{title}</h2>
          {subtitle && <p className="mt-1 text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

type Tone = 'strong' | 'neutral' | 'muted'

export function Badge({ children, tone = 'neutral', title }: { children: ReactNode; tone?: Tone; title?: string }) {
  const cls =
    tone === 'strong'
      ? 'bg-[color:var(--ink)] text-[#0a0a0a]'
      : tone === 'muted'
        ? 'border border-white/[0.08] text-[color:var(--ink-4)]'
        : 'bg-white/[0.08] text-[color:var(--ink-2)]'
  return (
    <span title={title} className={`f-mono inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.64rem] uppercase tracking-[0.08em] ${cls}`}>
      {children}
    </span>
  )
}

const STATUS_TONE: Record<string, Tone> = {
  completed: 'strong',
  active: 'strong',
  ok: 'strong',
  live: 'strong',
  pending: 'neutral',
  quoted: 'neutral',
  submitted: 'neutral',
  processing: 'neutral',
  paused: 'muted',
  failed: 'muted',
  rejected: 'muted',
  suspended: 'muted',
}

export function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || 'unknown').toLowerCase()
  return <Badge tone={STATUS_TONE[s] || 'neutral'}>{s}</Badge>
}

export type AlertLevel = 'critical' | 'warning' | 'info'

export function AlertItem({
  level,
  title,
  detail,
  action,
}: {
  level: AlertLevel
  title: string
  detail?: string
  action?: ReactNode
}) {
  const border =
    level === 'critical' ? 'border-white/40 bg-white/[0.06]' : level === 'warning' ? 'border-white/[0.16] bg-white/[0.03]' : 'border-white/[0.08]'
  return (
    <div role={level === 'critical' ? 'alert' : undefined} className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${border}`}>
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0 text-[color:var(--ink)]" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            {level === 'info' ? (
              <>
                <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 7.2v3.8M8 5v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M8 2.2 14.5 13.5h-13L8 2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M8 6.5v3.2M8 11.6v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </>
            )}
          </svg>
        </span>
        <div>
          <div className="text-[0.88rem] text-[color:var(--ink)]">
            {level === 'critical' && <span className="f-mono mr-2 text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--ink-2)]">Critical</span>}
            {title}
          </div>
          {detail && <p className="mt-1 text-[0.8rem] leading-relaxed text-[color:var(--ink-3)]">{detail}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 sm:pl-4">{action}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- tables */

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  onRowClick,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string
  empty?: ReactNode
  onRowClick?: (row: T) => void
}) {
  if (rows.length === 0 && empty) return <>{empty}</>
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.03] text-[0.66rem] uppercase text-[color:var(--ink-4)]">
          <tr>
            {columns.map(c => (
              <th key={c.key} className={`whitespace-nowrap px-3.5 py-3 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-t border-white/[0.06] ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map(c => (
                <td key={c.key} className={`px-3.5 py-3 align-middle text-[color:var(--ink-2)] ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}>
                  {c.render ? c.render(row) : String((row as any)[c.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pager({
  offset,
  limit,
  total,
  count,
  onChange,
}: {
  offset: number
  limit: number
  total?: number | null
  count: number
  onChange: (offset: number) => void
}) {
  const hasTotal = typeof total === 'number'
  const canPrev = offset > 0
  const canNext = hasTotal ? offset + limit < (total as number) : count === limit
  const from = count ? offset + 1 : 0
  const to = offset + count
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-[0.78rem] text-[color:var(--ink-3)]">
      <span className="f-mono">
        {from}-{to}
        {hasTotal ? ` of ${fmtNum(total)}` : ''}
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={!canPrev} onClick={() => onChange(Math.max(0, offset - limit))} className="pill pill-dark h-9 disabled:opacity-40">
          Previous
        </button>
        <button type="button" disabled={!canNext} onClick={() => onChange(offset + limit)} className="pill pill-dark h-9 disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- charts */

export function BreakdownBars({
  rows,
  format = n => fmtNum(n),
  empty = 'No data in this period.',
}: {
  rows: { label: string; value: number; sub?: string }[]
  format?: (n: number) => string
  empty?: string
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-[0.84rem] text-[color:var(--ink-4)]">{empty}</p>
  const max = Math.max(...rows.map(r => r.value), 0) || 1
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(r => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.82rem]">
            <span className="truncate text-[color:var(--ink-2)]">{r.label}</span>
            <span className="f-mono shrink-0 text-[color:var(--ink-3)]">
              {format(r.value)}
              {r.sub && <span className="ml-2 text-[color:var(--ink-4)]">{r.sub}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-white/70" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function TimeSeries({
  data,
  series,
  type = 'area',
  height = 240,
  xKey = 'date',
  money = false,
}: {
  data: Record<string, any>[]
  series: { key: string; name: string }[]
  type?: 'area' | 'bar'
  height?: number
  xKey?: string
  money?: boolean
}) {
  const tick = (v: any) => String(v).slice(5, 10)
  const yTick = (v: number) => (money ? fmtUsd(v, 0) : fmtNum(v))
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'bar' ? (
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey={xKey} stroke={CHART.axis} tick={{ fontSize: 10 }} tickFormatter={tick} minTickGap={16} />
          <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={52} tickFormatter={yTick} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="stack" fill={CHART.series[i % CHART.series.length]} radius={i === series.length - 1 ? [3, 3, 0, 0] : 0} />
          ))}
        </BarChart>
      ) : (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`kit-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.series[i % CHART.series.length]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART.series[i % CHART.series.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey={xKey} stroke={CHART.axis} tick={{ fontSize: 10 }} tickFormatter={tick} minTickGap={16} />
          <YAxis stroke={CHART.axis} tick={{ fontSize: 10 }} width={52} tickFormatter={yTick} />
          <Tooltip content={<ChartTooltip />} />
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={CHART.series[i % CHART.series.length]}
              fill={`url(#kit-fill-${s.key})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      )}
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ misc */

/** A labelled value in a key/value detail list. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5 text-[0.84rem] last:border-b-0">
      <span className="shrink-0 text-[color:var(--ink-4)]">{label}</span>
      <span className="min-w-0 break-all text-right text-[color:var(--ink-2)]">{children}</span>
    </div>
  )
}

/** A small external link with the site's arrow, for explorers and docs. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[color:var(--ink-2)] underline decoration-white/20 underline-offset-2 hover:text-[color:var(--ink)]">
      {children}
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
