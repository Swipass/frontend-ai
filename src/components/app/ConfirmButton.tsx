// src/components/app/ConfirmButton.tsx
import { ApprovalPayload, IntentResponse } from '../../services/intentService'
import type { TxAttempt } from './txStateMachine'
import { Icon, Spinner } from './shared'

interface ConfirmButtonProps {
  result: IntentResponse | null
  approval?: ApprovalPayload | null
  txState: TxAttempt
  isSending: boolean
  onConfirm: () => void
  onCheckReceipt: () => void
}

export function ConfirmButton({
  result,
  approval,
  txState,
  isSending,
  onConfirm,
  onCheckReceipt,
}: ConfirmButtonProps) {
  if (!result) return null

  // A route that spends an ERC20 takes two signatures: the allowance, then the
  // transaction. Say so up front rather than surprising the user mid-flow.
  const approvalLabel = approval?.is_reset
    ? `Reset ${approval.token_symbol} allowance`
    : approval
    ? `Approve ${approval.token_symbol}`
    : null

  const { stage } = txState
  let label: string
  let helper: string
  let disabled = true
  let action = onConfirm

  if (stage === 'receipt_check_required') {
    label = 'Check status'
    helper =
      'The network is being slow to confirm this. Nothing has failed -- a transaction that already mined will be recognized as soon as we can see it.'
    disabled = false
    action = onCheckReceipt
  } else if (isSending) {
    label = 'Awaiting wallet...'
    helper = 'Review it in your wallet. The transaction is broadcast after you sign.'
  } else if (stage === 'approval_confirming') {
    label = 'Confirming approval...'
    helper = 'Waiting for the approval to be mined before the swap can be prepared.'
  } else if (stage === 'swap_confirming') {
    label = 'Processing swap...'
    helper = 'Waiting for the swap to be mined on-chain.'
  } else if (stage === 'approval_confirmed' || stage === 'rebuilding_swap') {
    label = 'Preparing swap...'
    helper = 'Allowance confirmed. Building the swap transaction now.'
  } else if (stage === 'swap_confirmed' || stage === 'reporting') {
    label = 'Swap confirmed'
    helper = 'Reporting the settled transaction.'
  } else if (approvalLabel) {
    label = approvalLabel
    helper = `${approval?.token_symbol} must be approved before this route can run. Two signatures: the approval, then the transaction.`
    disabled = false
  } else if (txState.error === 'Confirm swap to continue') {
    // The approval landed and the swap was rebuilt, but the wallet did not
    // produce a second signature automatically (many wallets need a fresh
    // click for that). This is the explicit, unmistakable action state --
    // never a silent retry and never left on a bare "Processing...".
    label = 'Approval confirmed. Confirm swap'
    helper = 'Your allowance is set. Confirm to sign the swap.'
    disabled = false
  } else {
    label = 'Confirm and sign'
    helper = 'Review it in your wallet. The transaction is broadcast after you sign.'
    disabled = false
  }

  const busy = disabled && stage !== 'receipt_check_required'

  return (
    <div className="flex flex-col gap-2.5 pt-3">
      <button
        type="button"
        onClick={action}
        disabled={disabled}
        className={`pill h-[3.25rem] w-full text-[0.95rem] ${
          disabled
            ? 'cursor-not-allowed border-white/[0.08] bg-white/[0.08] text-[color:var(--ink-3)]'
            : 'pill-light shadow-[0_0_44px_-10px_rgba(255,255,255,0.5)]'
        }`}
      >
        {busy ? <Spinner size={14} light /> : stage === 'receipt_check_required' ? <Icon.Warning size={16} /> : !approvalLabel && <Icon.Check size={16} />}
        {label}
      </button>
      <p className="m-0 text-center text-[0.74rem] leading-relaxed text-[color:var(--ink-4)]">{helper}</p>
    </div>
  )
}
