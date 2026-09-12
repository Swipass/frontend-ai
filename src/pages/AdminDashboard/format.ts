// src/pages/AdminDashboard/format.ts
// Small formatters and helpers the admin pages share on top of the kit's.
import { fmtUsd } from './shared'

/** A token amount as sent by the API (often a long decimal string), trimmed to read. */
export function fmtAmount(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '-'
  const n = Number(value)
  if (!isFinite(n)) return String(value)
  return n.toLocaleString(undefined, { maximumFractionDigits: n !== 0 && Math.abs(n) < 1 ? 6 : 4 })
}

/** Fees on small trades are fractions of a cent; show them rather than $0.00. */
export function fmtFee(value?: number | null): string {
  if (value === null || value === undefined) return '-'
  const n = Number(value)
  return fmtUsd(n, n > 0 && n < 0.01 ? 4 : 2)
}

/** "base → arbitrum", or one chain for a same-chain swap. */
export function routeLabel(from?: string | null, to?: string | null): string {
  if (!from && !to) return '-'
  if (!to || from === to) return from || to || '-'
  return `${from || '?'} → ${to}`
}

/** Truth return: what landed against what was quoted, in basis points. */
export function truthLabel(bps?: number | null): string {
  if (bps === null || bps === undefined) return '-'
  return `${bps > 0 ? '+' : ''}${bps} bps`
}

export function fullDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return isFinite(d.getTime()) ? d.toLocaleString() : '-'
}

/** Epoch seconds or an ISO string, as the API sends either for "updated_at". */
export function fullDateFromAny(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '-'
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return isFinite(d.getTime()) ? d.toLocaleString() : '-'
}

/** A staff role as shown in tables and selects. */
export const ROLE_LABELS: Record<string, string> = {
  '': 'user',
  developer: 'developer',
  staff_support: 'support',
  staff_finance: 'finance',
  staff_moderator: 'moderator',
  super_admin: 'super admin',
}

export const ROLES = ['', 'developer', 'staff_support', 'staff_finance', 'staff_moderator', 'super_admin']

/** Save rows as a CSV file in the browser. Every value is quoted, so commas and quotes in commands are safe. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const text = [headers.map(cell).join(','), ...rows.map(r => r.map(cell).join(','))].join('\n')
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
