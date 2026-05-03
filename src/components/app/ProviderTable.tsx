// src/components/app/ProviderTable.tsx
import React from 'react'
import { IntentResponse, QuoteResponse } from '../../services/intentService'
import { C, uppercaseLabel } from './shared'

interface ProviderTableProps {
  result: IntentResponse
  selectedProvider: string
  onSelectProvider: (provider: string) => void
}

export function ProviderTable({
  result,
  selectedProvider,
  onSelectProvider,
}: ProviderTableProps) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          ...uppercaseLabel,
          marginBottom: '0.6rem',
          display: 'block',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
        }}
      >
        Provider Quotes — Select one to execute
      </div>
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr 0.8fr 0.7fr 1fr',
            padding: '0.5rem 1rem',
            background: C.surface,
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.muted,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {['Provider', 'Output', 'Time', 'Score', 'Select'].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {result.all_quotes.map((q: QuoteResponse, i: number) => {
          const isSelected = q.provider === selectedProvider
          return (
            <button
              key={i}
              onClick={() => onSelectProvider(q.provider)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr 0.8fr 0.7fr 1fr',
                padding: '0.65rem 1rem',
                borderBottom:
                  i < result.all_quotes.length - 1
                    ? `1px solid ${C.border}`
                    : 'none',
                background: isSelected ? C.surface : C.panel,
                fontSize: '0.7rem',
                alignItems: 'center',
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'DM Mono',monospace",
                transition: 'background 0.2s',
                outline: isSelected ? `1px solid ${C.max}` : 'none',
              }}
            >
              <span
                style={{
                  color: isSelected ? C.max : C.muted,
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {q.provider}
              </span>
              <span style={{ color: isSelected ? C.max : C.muted }}>
                {parseFloat(q.to_amount).toFixed(4)} {q.to_token}
              </span>
              <span style={{ color: C.muted }}>
                ~{q.estimated_time_seconds}s
              </span>
              <span>
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '0.12rem 0.45rem',
                    background: isSelected ? C.mid : C.surface2,
                    borderRadius: 3,
                    fontSize: '0.6rem',
                    color: isSelected ? C.max : C.body,
                  }}
                >
                  {q.score.toFixed(1)}
                </div>
              </span>
              <span>
                {isSelected ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.12rem 0.45rem',
                      background: C.mid,
                      borderRadius: 3,
                      fontSize: '0.58rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: C.max,
                    }}
                  >
                    ✓ Selected
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '0.12rem 0.45rem',
                      background: C.surface2,
                      borderRadius: 3,
                      fontSize: '0.58rem',
                      color: C.muted,
                    }}
                  >
                    Choose
                  </div>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}