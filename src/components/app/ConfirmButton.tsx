// src/components/app/ConfirmButton.tsx
import { ApprovalPayload, IntentResponse } from '../../services/intentService'
import { Icon, Spinner } from './shared'

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
    : 'Confirm and sign'

  return (
    <div className="flex flex-col gap-2.5 pt-3">
      <button
        type="button"
        onClick={onConfirm}
        disabled={isConfirming}
        className={`pill h-[3.25rem] w-full text-[0.95rem] ${
          isConfirming
            ? 'cursor-not-allowed border-white/[0.08] bg-white/[0.08] text-[color:var(--ink-3)]'
            : 'pill-light shadow-[0_0_44px_-10px_rgba(255,255,255,0.5)]'
        }`}
      >
        {isConfirming ? <Spinner size={14} light /> : !approvalLabel && <Icon.Check size={16} />}
        {label}
      </button>
      <p className="m-0 text-center text-[0.74rem] leading-relaxed text-[color:var(--ink-4)]">
        {approvalLabel
          ? `${approval?.token_symbol} must be approved before this route can run. Two signatures: the approval, then the transaction.`
          : 'Review it in your wallet. The transaction is broadcast after you sign.'}
      </p>
    </div>
  )
}
