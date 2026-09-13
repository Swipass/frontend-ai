// src/components/app/txStateMachine.ts
// Explicit stages for the two-signature (approval -> swap) or single-signature
// execution flow, replacing a set of loosely coupled booleans
// (confirming/isSending/isWaiting/txBuilding/txKindRef) with one state machine
// that knows exactly what it is doing and refuses to do it twice.
//
// Kept deliberately small: this tracks *which transaction is in flight and
// how far it got*, not the transaction payloads themselves (those stay in
// useIntentExecution's existing currentTransaction/approval state, since they
// depend on the live quote and are never safe to silently resurrect after a
// refresh -- a quote can expire).
export type TxKind = 'approval' | 'swap'

export type TxStage =
  | 'idle'
  | 'awaiting_approval_signature'
  | 'approval_submitted'
  | 'approval_confirming'
  | 'approval_confirmed'
  | 'rebuilding_swap'
  | 'awaiting_swap_signature'
  | 'swap_submitted'
  | 'swap_confirming'
  | 'swap_confirmed'
  | 'reporting'
  | 'success'
  | 'failed'
  | 'receipt_check_required'

export interface TxAttempt {
  stage: TxStage
  kind: TxKind | null
  hash: string | null
  provider: string | null
  quoteId: string | null
  error: string | null
}

export const IDLE_ATTEMPT: TxAttempt = {
  stage: 'idle',
  kind: null,
  hash: null,
  provider: null,
  quoteId: null,
  error: null,
}

export type TxAction =
  | { type: 'RESET' }
  | { type: 'RESTORE'; attempt: TxAttempt }
  | { type: 'REQUEST_SIGNATURE'; kind: TxKind; provider: string; quoteId: string }
  | { type: 'SIGNATURE_REJECTED'; message: string }
  | { type: 'SUBMITTED'; hash: string }
  | { type: 'CONFIRMING' }
  | { type: 'CONFIRMED'; hash: string }
  | { type: 'REVERTED'; hash: string }
  | { type: 'RECEIPT_TIMEOUT' }
  | { type: 'RECEIPT_RECOVERED'; hash: string; success: boolean }
  | { type: 'REBUILDING' }
  | { type: 'REPORTING' }
  | { type: 'REPORTED' }

/** Whether a fresh signature of this kind may be requested from the current stage. */
export function canRequestSignature(state: TxAttempt, kind: TxKind): boolean {
  if (kind === 'approval') return state.stage === 'idle' || state.stage === 'failed'
  return state.stage === 'idle' || state.stage === 'rebuilding_swap' || state.stage === 'failed'
}

const revertMessage = (kind: TxKind | null) =>
  `${kind === 'approval' ? 'Approval' : 'Transaction'} reverted on-chain`

export function txReducer(state: TxAttempt, action: TxAction): TxAttempt {
  switch (action.type) {
    case 'RESET':
      return IDLE_ATTEMPT

    case 'RESTORE':
      return action.attempt

    case 'REQUEST_SIGNATURE':
      // Guard: a stage already past "idle"/"failed" for this kind refuses a
      // second signature request outright, so a re-render or a duplicate
      // effect firing cannot open the wallet twice for the same step.
      if (!canRequestSignature(state, action.kind)) return state
      return {
        stage: action.kind === 'approval' ? 'awaiting_approval_signature' : 'awaiting_swap_signature',
        kind: action.kind,
        hash: null,
        provider: action.provider,
        quoteId: action.quoteId,
        error: null,
      }

    case 'SIGNATURE_REJECTED':
      // Back to idle so the same action is immediately retryable; the caller
      // keeps whatever transaction/approval payload it already built, it is
      // not thrown away just because the wallet declined once.
      return { ...IDLE_ATTEMPT, error: action.message }

    case 'SUBMITTED':
      if (state.stage !== 'awaiting_approval_signature' && state.stage !== 'awaiting_swap_signature') {
        return state
      }
      return {
        ...state,
        stage: state.kind === 'approval' ? 'approval_submitted' : 'swap_submitted',
        hash: action.hash,
      }

    case 'CONFIRMING':
      if (state.stage === 'approval_submitted') return { ...state, stage: 'approval_confirming' }
      if (state.stage === 'swap_submitted') return { ...state, stage: 'swap_confirming' }
      return state

    case 'CONFIRMED':
      // A receipt for a hash that is not the one this attempt is watching is
      // stale (a leftover from a previous attempt/remount) and is dropped.
      if (action.hash !== state.hash) return state
      if (state.kind === 'approval') return { ...state, stage: 'approval_confirmed' }
      if (state.kind === 'swap') return { ...state, stage: 'swap_confirmed' }
      return state

    case 'REVERTED':
      if (action.hash !== state.hash) return state
      return { ...state, stage: 'failed', error: revertMessage(state.kind) }

    case 'RECEIPT_TIMEOUT':
      if (state.stage !== 'approval_confirming' && state.stage !== 'swap_confirming') return state
      return { ...state, stage: 'receipt_check_required' }

    case 'RECEIPT_RECOVERED':
      if (action.hash !== state.hash) return state
      if (action.success) {
        return { ...state, stage: state.kind === 'approval' ? 'approval_confirmed' : 'swap_confirmed' }
      }
      return { ...state, stage: 'failed', error: revertMessage(state.kind) }

    case 'REBUILDING':
      if (state.stage !== 'approval_confirmed') return state
      return { ...state, stage: 'rebuilding_swap' }

    case 'REPORTING':
      return { ...state, stage: 'reporting' }

    case 'REPORTED':
      return { ...state, stage: 'success' }

    default:
      return state
  }
}

// --- Recovery across a refresh or a remount ---------------------------------
// Only the attempt's shape is persisted, never the transaction/approval
// payloads themselves (those come from a live quote and are never safe to
// silently resurrect -- a quote can expire). This lets a reload recognize
// "there was a pending approval/swap at hash X" and check it directly by hash
// instead of quietly forgetting and risking the user re-signing from scratch.
const STORAGE_KEY = 'swipass.tx.attempt.v1'

// Only a stage with a real submitted hash is worth recovering; idle/failed/
// success carry nothing usable across a reload.
const RECOVERABLE_STAGES = new Set<TxStage>([
  'approval_submitted',
  'approval_confirming',
  'swap_submitted',
  'swap_confirming',
  'receipt_check_required',
])

export function saveAttempt(attempt: TxAttempt): void {
  try {
    if (RECOVERABLE_STAGES.has(attempt.stage) && attempt.hash) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage unavailable (private mode, etc.): recovery is best-effort.
  }
}

export function loadAttempt(): TxAttempt | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TxAttempt
    if (!RECOVERABLE_STAGES.has(parsed.stage) || !parsed.hash) return null
    // A recovered attempt always needs a fresh receipt check: we cannot
    // trust that wagmi's own watcher is still running for this hash.
    return { ...parsed, stage: 'receipt_check_required' }
  } catch {
    return null
  }
}

export function clearSavedAttempt(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
