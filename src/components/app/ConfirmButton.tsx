// src/components/app/ConfirmButton.tsx
import React from 'react'
import { ApprovalPayload, IntentResponse } from '../../services/intentService'
import { C, Icon, Spinner } from './shared'

interface ConfirmButtonProps {
  result: IntentResponse | null
  approval?: ApprovalPayload | null
  isConfirming: boolean
  isSending: boolean
  isWaiting: boolean
  onConfirm: () => void
}

export function ConfirmButton({
  result,
  approval,
  isConfirming,
  isSending,
  isWaiting,
  onConfirm,
}: ConfirmButtonProps) {
  if (!result) return null

  // A route that spends an ERC20 takes two signatures: the allowance, then the
  // transaction. Say so up front rather than surprising the user mid-flow.
  const approvalLabel = approval?.is_reset
    ? `Reset ${approval.token_symbol} allowance`
    : approval
    ? `Approve ${approval.token_symbol}`
    : null

  const label = isSending
    ? 'Awaiting wallet...'
    : isWaiting
    ? 'Confirming on-chain...'
    : isConfirming
    ? 'Processing...'
    : approvalLabel
    ? `1 of 2: ${approvalLabel}`
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
        {approvalLabel
          ? `${approval?.token_symbol} must be approved before this route can run. Two signatures: the approval, then the transaction.`
          : 'Review in your wallet. Transaction broadcast after signature.'}
      </p>
    </div>
  )
}