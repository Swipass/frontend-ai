// src/components/app/TxPreviewContent.tsx
import React from 'react'
import { IntentResponse } from '../../services/intentService'
import { C, uppercaseLabel, displayFont, borderBottom, Icon } from './shared'

interface TxPreviewContentProps {
  result: IntentResponse | null
  displayChains: string[]
}

export function TxPreviewContent({ result, displayChains }: TxPreviewContentProps) {
  if (!result)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '1rem 0',
            color: C.mid,
            textAlign: 'center',
          }}
        >
          <div style={{ opacity: 0.25 }}>
            <Icon.Arrow size={36} />
          </div>
          <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, color: C.muted }}>
            Execute a command to see your transaction details here
          </p>
        </div>
        <div>
          <div
            style={{
              ...uppercaseLabel,
              marginBottom: '0.6rem',
              paddingBottom: '0.4rem',
              ...borderBottom,
              display: 'block',
            }}
          >
            Supported Chains
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {displayChains.map(c => (
              <div
                key={c}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 5,
                  fontSize: '0.68rem',
                  color: C.body,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: C.muted,
                  }}
                />
                {c}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              ...uppercaseLabel,
              marginBottom: '0.6rem',
              paddingBottom: '0.4rem',
              ...borderBottom,
              display: 'block',
            }}
          >
            Fee Structure
          </div>
          {[
            ['Direct use fee', '0.10%'],
            ['Via developer app', '0.15%'],
            ['Gas estimate', '~$2–8'],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                padding: '0.45rem 0',
                ...borderBottom,
              }}
            >
              <span style={{ color: C.muted }}>{l}</span>
              <span style={{ color: C.label }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: '1rem',
          ...borderBottom,
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ ...uppercaseLabel, marginBottom: '0.25rem', display: 'block' }}>
            You Send
          </div>
          <div
            style={{
              ...displayFont,
              fontSize: '1.35rem',
              fontWeight: 700,
              color: C.max,
              letterSpacing: '-0.02em',
            }}
          >
            {result.quote.from_amount}
          </div>
          <div style={{ fontSize: '0.75rem', color: C.body }}>
            {result.quote.from_token}
          </div>
          <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 2 }}>
            on {result.quote.from_chain}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0 0.6rem',
            color: C.mid,
          }}
        >
          <div style={{ width: 32, height: 1, background: C.mid, position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                right: -5,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.35rem',
              }}
            >
              ▶
            </span>
          </div>
          <div
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: C.muted,
              textAlign: 'center',
            }}
          >
            via {result.selected_provider}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div
            style={{
              ...uppercaseLabel,
              marginBottom: '0.25rem',
              display: 'block',
              textAlign: 'right',
            }}
          >
            You Receive
          </div>
          <div
            style={{
              ...displayFont,
              fontSize: '1.35rem',
              fontWeight: 700,
              color: C.max,
              letterSpacing: '-0.02em',
            }}
          >
            {parseFloat(result.quote.to_amount).toFixed(4)}
          </div>
          <div style={{ fontSize: '0.75rem', color: C.body }}>
            {result.quote.to_token}
          </div>
          <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 2 }}>
            on {result.quote.to_chain}
          </div>
        </div>
      </div>

      {[
        [
          'Platform fee',
          `${result.quote.fee_amount} ${result.quote.fee_token} (0.10%)`,
        ],
        ['Est. gas', `~$${result.quote.estimated_gas_usd}`],
        ['Est. time', `~${result.quote.estimated_time_seconds}s`],
        ['Provider', result.selected_provider],
        ['Route score', `${result.quote.score.toFixed(1)} / 100`],
      ].map(([l, v]) => (
        <div
          key={l}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.55rem 0',
            ...borderBottom,
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: C.muted }}>{l}</span>
          <span
            style={{
              color: l === 'Provider' ? C.max : C.label,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {v}
          </span>
        </div>
      ))}

      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.75rem',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
        }}
      >
        <div style={{ ...uppercaseLabel, marginBottom: '0.3rem', display: 'block' }}>
          Destination
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: result.destination_address ? C.label : C.muted,
            fontStyle: result.destination_address ? 'normal' : 'italic',
            wordBreak: 'break-all',
          }}
        >
          {result.destination_note}
        </div>
      </div>
    </div>
  )
}