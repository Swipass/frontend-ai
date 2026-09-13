// src/components/app/ProviderTable.tsx
import { useMemo, useState } from 'react'
import { IntentResponse, QuoteResponse, ProviderRating } from '../../services/intentService'
import { Icon } from './shared'
import { cexDelta, formatDelta, venueList } from './benchmark'

interface ProviderTableProps {
  result: IntentResponse
  selectedProvider: string
  onSelectProvider: (provider: string) => void
  ratings: ProviderRating[]
}

type SortMode = 'output' | 'reliable' | 'fastest' | 'slippage'

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'output', label: 'Best output' },
  { id: 'reliable', label: 'Most reliable' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'slippage', label: 'Lowest slippage' },
]

// A single 0-1 reliability figure from whatever the analytics endpoint returns.
function reliabilityScore(r?: ProviderRating): number | null {
  if (!r) return null
  if (typeof r.rating === 'number') return r.rating
  if (typeof r.success_rate === 'number') return r.success_rate
  if (typeof r.avg_truth_return_bps === 'number') return r.avg_truth_return_bps
  return null
}

// Human label for the rating chip, or null when there's nothing to show.
function ratingLabel(r?: ProviderRating): string | null {
  if (!r) return null
  if (typeof r.rating === 'number') return `★ ${r.rating.toFixed(1)}`
  if (typeof r.success_rate === 'number') return `${(r.success_rate * 100).toFixed(0)}% ok`
  if (typeof r.avg_truth_return_bps === 'number') return `${r.avg_truth_return_bps.toFixed(0)} bps`
  return null
}

function sortQuotes(quotes: QuoteResponse[], sort: SortMode, hasRatings: boolean, ratingMap: Map<string, ProviderRating>) {
  const list = [...quotes]
  // No rating data -> reliability sort gracefully falls back to best output.
  const effectiveSort = sort === 'reliable' && !hasRatings ? 'output' : sort
  list.sort((a, b) => {
    switch (effectiveSort) {
      case 'fastest':
        return a.estimated_time_seconds - b.estimated_time_seconds
      case 'slippage':
        return (
          Math.abs(parseFloat(a.price_impact_percent || '0')) -
          Math.abs(parseFloat(b.price_impact_percent || '0'))
        )
      case 'reliable': {
        const ra = reliabilityScore(ratingMap.get(a.provider.toLowerCase())) ?? -1
        const rb = reliabilityScore(ratingMap.get(b.provider.toLowerCase())) ?? -1
        if (rb !== ra) return rb - ra
        return parseFloat(b.to_amount) - parseFloat(a.to_amount)
      }
      case 'output':
      default:
        return parseFloat(b.to_amount) - parseFloat(a.to_amount)
    }
  })
  return list
}

function QuoteRow({
  quote,
  isSelected,
  onSelect,
  rLabel,
  delta,
}: {
  quote: QuoteResponse
  isSelected: boolean
  onSelect: () => void
  rLabel: string | null
  delta: number | null
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2.5 rounded-2xl border px-4 pb-3 pt-3.5 text-left transition-all duration-300 ${
        isSelected
          ? 'border-white/40 bg-white/[0.07]'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.8rem] font-medium ${
            isSelected ? 'bg-[color:var(--ink)] text-[#0a0a0a]' : 'border border-white/[0.12] text-[color:var(--ink-2)]'
          }`}
        >
          {quote.provider.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[0.92rem] ${isSelected ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-2)]'}`}>
              {quote.provider}
            </span>
            {rLabel && (
              <span className="f-mono rounded-full bg-white/[0.07] px-2 py-0.5 text-[0.62rem] text-[color:var(--ink-3)]">
                {rLabel}
              </span>
            )}
          </div>
          <div className="f-mono mt-0.5 flex items-center gap-2 text-[0.66rem] text-[color:var(--ink-4)]">
            <span>~{quote.estimated_time_seconds}s</span>
            <span>·</span>
            <span>score {quote.score.toFixed(1)}</span>
            {delta != null && (
              <>
                <span>·</span>
                <span className={delta >= 0 ? 'text-[color:var(--ink-2)]' : undefined}>{formatDelta(delta)} vs CEX</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`f-mono text-[0.95rem] ${isSelected ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-2)]'}`}>
            {parseFloat(quote.to_amount).toFixed(4)}
          </div>
          <div className="f-mono text-[0.64rem] text-[color:var(--ink-4)]">{quote.to_token}</div>
        </div>
        <span
          className={`grid h-6 w-6 place-items-center rounded-full border transition-colors ${
            isSelected ? 'border-transparent bg-[color:var(--ink)] text-[#0a0a0a]' : 'border-white/[0.14] text-transparent'
          }`}
          aria-hidden="true"
        >
          <Icon.Check size={12} />
        </span>
      </div>

      <div className="h-px w-full basis-full overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
        <div
          className={`h-px transition-[width] duration-700 ${isSelected ? 'bg-white/80' : 'bg-white/30'}`}
          style={{ width: `${Math.max(0, Math.min(100, quote.score))}%` }}
        />
      </div>
    </button>
  )
}

export function ProviderTable({ result, selectedProvider, onSelectProvider, ratings }: ProviderTableProps) {
  const [sort, setSort] = useState<SortMode>('output')
  const [expanded, setExpanded] = useState(false)

  const ratingMap = useMemo(() => {
    const m = new Map<string, ProviderRating>()
    ratings.forEach(r => m.set(r.provider.toLowerCase(), r))
    return m
  }, [ratings])
  const hasRatings = ratingMap.size > 0

  // The backend already leads all_quotes with the route it actually selected
  // and built (see cap_display_quotes in app/core/service.py) -- it stays the
  // primary candidate here regardless of how the alternatives below are
  // sorted, since "best" is Swipass's own routing decision, not a display sort.
  const best = result.all_quotes[0] ?? result.quote
  const alternatives = useMemo(
    () => sortQuotes(result.all_quotes.slice(1), sort, hasRatings, ratingMap),
    [result.all_quotes, sort, hasRatings, ratingMap],
  )

  const rowProps = (q: QuoteResponse) => ({
    quote: q,
    isSelected: q.provider === selectedProvider,
    onSelect: () => onSelectProvider(q.provider),
    rLabel: ratingLabel(ratingMap.get(q.provider.toLowerCase())),
    delta: cexDelta(q, result.benchmark),
  })

  return (
    <div className="mt-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="kicker">Best route</span>
        <span className="text-[0.74rem] text-[color:var(--ink-4)]">{result.all_quotes.length} provider{result.all_quotes.length === 1 ? '' : 's'} responded</span>
      </div>

      <QuoteRow {...rowProps(best)} />

      {alternatives.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-[0.76rem] text-[color:var(--ink-4)] transition-colors hover:text-[color:var(--ink-2)]"
          >
            {expanded ? 'Hide alternative routes' : `More routes (${alternatives.length})`}
            <span className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
              <Icon.ChevronDown size={11} />
            </span>
          </button>

          {expanded && (
            <div className="app-rise mt-2">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <span className="kicker">Alternative routes</span>
                <span className="text-[0.74rem] text-[color:var(--ink-4)]">Select one to execute instead</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => {
                  const active = sort === opt.id
                  const sortDisabled = opt.id === 'reliable' && !hasRatings
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSort(opt.id)}
                      title={sortDisabled ? 'No reliability data yet - showing best output' : undefined}
                      className={`whitespace-nowrap rounded-full border px-3 py-1 text-[0.74rem] transition-all duration-300 ${
                        active
                          ? 'border-transparent bg-[color:var(--ink)] text-[#0a0a0a]'
                          : sortDisabled
                          ? 'border-white/[0.06] text-[color:var(--ink-4)]'
                          : 'border-white/[0.1] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-col gap-1.5">
                {alternatives.map(q => (
                  <QuoteRow key={q.quote_id || q.provider} {...rowProps(q)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {result.benchmark && (
        <p className="mt-2.5 text-[0.7rem] leading-relaxed text-[color:var(--ink-4)]">
          vs CEX compares each route with the mid price on {venueList(result.benchmark.venues)}, before exchange
          fees. Reference only: nothing trades on an exchange.
        </p>
      )}
    </div>
  )
}
