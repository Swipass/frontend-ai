// src/components/app/TxPreviewContent.tsx
import React from 'react'
import { ApprovalPayload, IntentResponse } from '../../services/intentService'
import { C, uppercaseLabel, displayFont, borderBottom, Icon } from './shared'

interface TxPreviewContentProps {
  result: IntentResponse | null
  displayChains: string[]
  feeInfo?: { direct?: string; developer?: string }
  tokens?: string[]
  // How many tokens the selected chain supports in total, and the live search
  // over them. The list is far too long to render, so this is a lookup, not a
  // catalogue.
  tokenTotal?: number
  tokenQuery?: string
  onTokenQuery?: (q: string) => void
  approval?: ApprovalPayload | null
}

// What the pre-flight simulation could establish about this route, said plainly.
// A route we could not verify is labelled as unverified, never as checked.
function simulationNote(result: IntentResponse): { text: string; verified: boolean } {
  if (result.simulation_passed) {
    return { text: 'Simulated on-chain: this transaction executes', verified: true }
  }
  switch (result.simulation_reason) {
    case 'needs_approval':
      return { text: 'Verified after the approval below is signed', verified: false }
    case 'no_rpc':
    case 'rpc_error':
      return { text: 'Not simulated: no node available for this chain', verified: false }
    default:
      return { text: 'Not simulated', verified: false }
  }
}

export function TxPreviewContent({
  result,
  displayChains,
  feeInfo,
  tokens,
  tokenTotal,
  tokenQuery,
  onTokenQuery,
  approval,
}: TxPreviewContentProps) {
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
        {tokens && (
          <div>
            <div
              style={{
                ...uppercaseLabel,
                marginBottom: '0.6rem',
                paddingBottom: '0.4rem',
                ...borderBottom,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '0.5rem',
              }}
            >
              <span>Supported Tokens</span>
              {!!tokenTotal && (
                <span style={{ color: C.muted, letterSpacing: 0 }}>
                  {tokenTotal.toLocaleString()} on this chain
                </span>
              )}
            </div>
            {onTokenQuery && (
              <input
                value={tokenQuery || ''}
                onChange={e => onTokenQuery(e.target.value)}
                placeholder="Search a token"
                style={{
                  width: '100%',
                  marginBottom: '0.6rem',
                  padding: '0.4rem 0.6rem',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.label,
                  fontFamily: "'DM Mono',monospace",
                  fontSize: '0.7rem',
                  outline: 'none',
                }}
              />
            )}
            {tokens.length === 0 && (
              <p style={{ fontSize: '0.68rem', color: C.muted, margin: 0 }}>
                {tokenQuery
                  ? `No token matching "${tokenQuery}" on this chain.`
                  : 'No tokens resolved for this chain yet.'}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {tokens.map(t => (
                <span
                  key={t}
                  style={{
                    padding: '0.25rem 0.55rem',
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    fontSize: '0.66rem',
                    color: C.body,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
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
            ['Direct use fee', feeInfo?.direct || '-'],
            ['Via developer app', feeInfo?.developer || '-'],
            ['Gas', 'Shown per route at quote time'],
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

  // Platform fee % is derived from the quote's fee_amount vs from_amount,
  // never a hardcoded rate.
  const feePctNum = (() => {
    const fee = parseFloat(result.quote.fee_amount)
    const from = parseFloat(result.quote.from_amount)
    if (!isFinite(fee) || !isFinite(from) || from === 0) return null
    return (fee / from) * 100
  })()
  const feeLabel = `${result.quote.fee_amount} ${result.quote.fee_token}${
    feePctNum != null ? ` (${feePctNum.toFixed(2)}%)` : ''
  }`

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
        // The floor is what the user is actually guaranteed on chain, so it is
        // shown next to the estimate rather than left in the response.
        [
          'Guaranteed minimum',
          `${parseFloat(result.quote.guaranteed_to_amount || result.quote.to_amount).toFixed(4)} ${
            result.quote.to_token
          }`,
        ],
        ['Platform fee', feeLabel],
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

      {approval && (
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
            Approval required
          </div>
          <div style={{ fontSize: '0.72rem', color: C.label, lineHeight: 1.5 }}>
            {approval.is_reset
              ? `${approval.token_symbol} requires its allowance to be reset before a new one is set.`
              : `${result.selected_provider} must be allowed to move your ${approval.token_symbol}.`}{' '}
            You sign this first, then the transaction.
          </div>
        </div>
      )}

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
          Pre-flight check
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: simulationNote(result).verified ? C.label : C.muted,
            lineHeight: 1.5,
          }}
        >
          {simulationNote(result).text}
        </div>
      </div>

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