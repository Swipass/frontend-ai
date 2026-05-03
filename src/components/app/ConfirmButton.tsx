// src/components/app/ConfirmButton.tsx
import React from 'react'
import { IntentResponse } from '../../services/intentService'
import { C, Icon, Spinner } from './shared'

interface ConfirmButtonProps {
  result: IntentResponse | null
  isConfirming: boolean
  isSending: boolean
  isWaiting: boolean
  onConfirm: () => void
}

export function ConfirmButton({
  result,
  isConfirming,
  isSending,
  isWaiting,
  onConfirm,
}: ConfirmButtonProps) {
  if (!result) return null

  const label = isSending
    ? 'Awaiting wallet...'
    : isWaiting
    ? 'Confirming on-chain...'
    : isConfirming
    ? 'Processing...'
    : '✓ Confirm & Sign'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.75rem' }}>
      <button
        onClick={onConfirm}
        disabled={isConfirming}
        style={{
          width: '100%',
          padding: '0.9rem',
          background: isConfirming ? C.mid : C.max,
          color: isConfirming ? C.muted : C.bg,
          border: 'none',
          borderRadius: 8,
          fontFamily: "'DM Mono',monospace",
          fontSize: '0.78rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: isConfirming ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background 0.3s',
        }}
      >
        {isConfirming && <Spinner size={14} light />}
        {label}
      </button>
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.65rem',
          color: C.muted,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Review in your wallet. Transaction broadcast after signature.
      </p>
    </div>
  )
}