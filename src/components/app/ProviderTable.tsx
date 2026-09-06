// src/components/app/ProviderTable.tsx
import { useMemo, useState } from 'react'
import { IntentResponse, QuoteResponse, ProviderRating } from '../../services/intentService'
import { C, uppercaseLabel } from './shared'

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

export function ProviderTable({ result, selectedProvider, onSelectProvider, ratings }: ProviderTableProps) {
  const [sort, setSort] = useState<SortMode>('output')

  const ratingMap = useMemo(() => {
    const m = new Map<string, ProviderRating>()
    ratings.forEach(r => m.set(r.provider.toLowerCase(), r))
    return m
  }, [ratings])

  const hasRatings = ratingMap.size > 0

  const sortedQuotes = useMemo(() => {
    const quotes = [...result.all_quotes]
    // No rating data -> reliability sort gracefully falls back to best output.
    const effectiveSort = sort === 'reliable' && !hasRatings ? 'output' : sort
    quotes.sort((a, b) => {
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
    return quotes
  }, [result.all_quotes, sort, hasRatings, ratingMap])

  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.6rem',
        }}
      >
        <span style={{ ...uppercaseLabel, fontSize: '0.6rem', letterSpacing: '0.12em' }}>
          Provider Quotes - Select one to execute
        </span>
      </div>

      {/* Sort / filter controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
        {SORT_OPTIONS.map(opt => {
          const active = sort === opt.id
          const disabled = opt.id === 'reliable' && !hasRatings
          return (
            <button
              key={opt.id}
              onClick={() => setSort(opt.id)}
              title={disabled ? 'No reliability data yet - showing best output' : undefined}
              style={{
                padding: '0.3rem 0.7rem',
                background: active ? C.mid : C.surface,
                border: `1px solid ${active ? C.mid : C.border}`,
                borderRadius: 20,
                fontSize: '0.62rem',
                letterSpacing: '0.04em',
                color: active ? C.max : disabled ? C.mid : C.muted,
                cursor: 'pointer',
                fontFamily: "'DM Mono',monospace",
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {sortedQuotes.map((q: QuoteResponse, i: number) => {
          const isSelected = q.provider === selectedProvider
          const rating = ratingMap.get(q.provider.toLowerCase())
          const rLabel = ratingLabel(rating)
          return (
            <button
              key={q.quote_id || q.provider || i}
              onClick={() => onSelectProvider(q.provider)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
                padding: '0.7rem 0.9rem',
                borderBottom: i < sortedQuotes.length - 1 ? `1px solid ${C.border}` : 'none',
                background: isSelected ? C.surface : C.panel,
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'DM Mono',monospace",
                transition: 'background 0.2s',
                outline: isSelected ? `1px solid ${C.max}` : 'none',
                outlineOffset: -1,
              }}
            >
              {/* Left: provider + rating + score */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: isSelected ? C.max : C.body,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {q.provider}
                  </span>
                  {rLabel && (
                    <span
                      style={{
                        padding: '0.08rem 0.4rem',
                        background: C.surface2,
                        borderRadius: 3,
                        fontSize: '0.56rem',
                        color: C.body,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rLabel}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', color: C.muted }}>
                  <span>~{q.estimated_time_seconds}s</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '0.08rem 0.4rem',
                      background: isSelected ? C.mid : C.surface2,
                      borderRadius: 3,
                      color: isSelected ? C.max : C.body,
                    }}
                  >
                    score {q.score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Right: output + select state */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: isSelected ? C.max : C.body }}>
                    {parseFloat(q.to_amount).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.56rem', color: C.muted }}>{q.to_token}</div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.5rem',
                    background: isSelected ? C.mid : C.surface2,
                    borderRadius: 3,
                    fontSize: '0.56rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: isSelected ? C.max : C.muted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isSelected ? '✓ Selected' : 'Choose'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
