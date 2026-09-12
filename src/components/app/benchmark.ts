// src/components/app/benchmark.ts
// Routes against the centralised exchange mid price the backend attaches to a
// quote. Informational only: nothing trades on an exchange.
import type { PriceBenchmark, QuoteResponse } from '../../services/intentService'

const VENUE_NAMES: Record<string, string> = {
  binance: 'Binance',
  coinbase: 'Coinbase',
  okx: 'OKX',
  kraken: 'Kraken',
  bybit: 'Bybit',
}

/** "Binance, Coinbase and Bybit" */
export function venueList(venues: string[]): string {
  const names = venues.map((v) => VENUE_NAMES[v] ?? v)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** One route against the CEX reference, in percent. Positive is better. */
export function cexDelta(quote: QuoteResponse, benchmark?: PriceBenchmark | null): number | null {
  if (!benchmark) return null
  const reference = parseFloat(benchmark.reference_to_amount)
  const routed = parseFloat(quote.to_amount)
  if (!isFinite(reference) || reference <= 0 || !isFinite(routed)) return null
  return ((routed - reference) / reference) * 100
}

export function formatDelta(delta: number): string {
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`
}
