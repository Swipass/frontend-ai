// src/pages/DeveloperDashboard/format.ts
// Small formatters the developer pages share on top of the kit's.
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
