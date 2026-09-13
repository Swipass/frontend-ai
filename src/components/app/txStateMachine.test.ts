// src/components/app/txStateMachine.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  txReducer,
  canRequestSignature,
  IDLE_ATTEMPT,
  saveAttempt,
  loadAttempt,
  clearSavedAttempt,
  type TxAttempt,
} from './txStateMachine'

const APPROVAL_REQUESTED: TxAttempt = {
  stage: 'awaiting_approval_signature',
  kind: 'approval',
  hash: null,
  provider: 'paraswap',
  quoteId: 'q1',
  error: null,
}

describe('canRequestSignature', () => {
  it('allows an approval from idle', () => {
    expect(canRequestSignature(IDLE_ATTEMPT, 'approval')).toBe(true)
  })

  it('allows a swap from idle (single-transaction providers)', () => {
    expect(canRequestSignature(IDLE_ATTEMPT, 'swap')).toBe(true)
  })

  it('allows a swap from rebuilding_swap (the post-approval path)', () => {
    const state: TxAttempt = { ...IDLE_ATTEMPT, stage: 'rebuilding_swap' }
    expect(canRequestSignature(state, 'swap')).toBe(true)
  })

  it('refuses a second approval while one is already awaiting a signature', () => {
    expect(canRequestSignature(APPROVAL_REQUESTED, 'approval')).toBe(false)
  })

  it('refuses a second approval while one is submitted and confirming', () => {
    const submitted: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_submitted', hash: '0xabc' }
    const confirming: TxAttempt = { ...submitted, stage: 'approval_confirming' }
    expect(canRequestSignature(submitted, 'approval')).toBe(false)
    expect(canRequestSignature(confirming, 'approval')).toBe(false)
  })

  it('refuses a swap while the approval has not confirmed yet', () => {
    const confirming: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' }
    expect(canRequestSignature(confirming, 'swap')).toBe(false)
  })

  it('refuses a swap while approval_confirmed has not yet moved to rebuilding_swap', () => {
    // REQUEST_SIGNATURE for swap is only issued after the rebuild completes
    // (see the auto-continue effect), never straight off approval_confirmed.
    const confirmed: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirmed', hash: '0xabc' }
    expect(canRequestSignature(confirmed, 'swap')).toBe(false)
  })

  it('allows a retry of the same kind from failed', () => {
    const failed: TxAttempt = { ...IDLE_ATTEMPT, stage: 'failed', error: 'reverted' }
    expect(canRequestSignature(failed, 'approval')).toBe(true)
    expect(canRequestSignature(failed, 'swap')).toBe(true)
  })
})

describe('txReducer: requesting a signature', () => {
  it('moves to awaiting_approval_signature and records provider/quote', () => {
    const next = txReducer(IDLE_ATTEMPT, {
      type: 'REQUEST_SIGNATURE',
      kind: 'approval',
      provider: 'paraswap',
      quoteId: 'q1',
    })
    expect(next.stage).toBe('awaiting_approval_signature')
    expect(next.kind).toBe('approval')
    expect(next.provider).toBe('paraswap')
    expect(next.quoteId).toBe('q1')
    expect(next.hash).toBeNull()
  })

  it('the guard is enforced inside the reducer itself, not only by the caller', () => {
    // Even if a caller forgets to check canRequestSignature first, a second
    // REQUEST_SIGNATURE while one is already in flight is a no-op.
    const next = txReducer(APPROVAL_REQUESTED, {
      type: 'REQUEST_SIGNATURE',
      kind: 'approval',
      provider: 'paraswap',
      quoteId: 'q1',
    })
    expect(next).toBe(APPROVAL_REQUESTED)
  })
})

describe('txReducer: submission and confirmation', () => {
  it('SUBMITTED only applies from an awaiting_*_signature stage', () => {
    const next = txReducer(APPROVAL_REQUESTED, { type: 'SUBMITTED', hash: '0xabc' })
    expect(next.stage).toBe('approval_submitted')
    expect(next.hash).toBe('0xabc')

    // A stray SUBMITTED from idle (e.g. a late-resolving stale promise) is ignored.
    const stray = txReducer(IDLE_ATTEMPT, { type: 'SUBMITTED', hash: '0xdead' })
    expect(stray).toBe(IDLE_ATTEMPT)
  })

  it('CONFIRMING moves submitted -> confirming for the matching kind', () => {
    const submitted: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_submitted', hash: '0xabc' }
    expect(txReducer(submitted, { type: 'CONFIRMING' }).stage).toBe('approval_confirming')

    const swapSubmitted: TxAttempt = { ...IDLE_ATTEMPT, stage: 'swap_submitted', kind: 'swap', hash: '0xfeed' }
    expect(txReducer(swapSubmitted, { type: 'CONFIRMING' }).stage).toBe('swap_confirming')
  })

  it('CONFIRMED with a matching hash advances the correct kind', () => {
    const approvalConfirming: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' }
    expect(txReducer(approvalConfirming, { type: 'CONFIRMED', hash: '0xabc' }).stage).toBe('approval_confirmed')

    const swapConfirming: TxAttempt = { ...IDLE_ATTEMPT, stage: 'swap_confirming', kind: 'swap', hash: '0xfeed' }
    expect(txReducer(swapConfirming, { type: 'CONFIRMED', hash: '0xfeed' }).stage).toBe('swap_confirmed')
  })

  it('a stale receipt hash cannot advance the wrong (or any) attempt', () => {
    // Simulates a leftover receipt from a previous attempt/remount resolving
    // after a new attempt has already started.
    const currentAttempt: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xNEW' }
    const staleResult = txReducer(currentAttempt, { type: 'CONFIRMED', hash: '0xOLD' })
    expect(staleResult).toBe(currentAttempt)
    expect(staleResult.stage).toBe('approval_confirming')
  })

  it('a stale reverted receipt cannot fail the wrong attempt either', () => {
    const currentAttempt: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xNEW' }
    const staleResult = txReducer(currentAttempt, { type: 'REVERTED', hash: '0xOLD' })
    expect(staleResult).toBe(currentAttempt)
  })

  it('REVERTED with a matching hash fails with an explicit reason per kind', () => {
    const approvalConfirming: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' }
    const failed = txReducer(approvalConfirming, { type: 'REVERTED', hash: '0xabc' })
    expect(failed.stage).toBe('failed')
    expect(failed.error).toMatch(/Approval reverted/)

    const swapConfirming: TxAttempt = { ...IDLE_ATTEMPT, stage: 'swap_confirming', kind: 'swap', hash: '0xfeed' }
    const swapFailed = txReducer(swapConfirming, { type: 'REVERTED', hash: '0xfeed' })
    expect(swapFailed.error).toMatch(/Transaction reverted/)
  })
})

describe('txReducer: rejection returns an immediately actionable state', () => {
  it('SIGNATURE_REJECTED resets to idle (not a dead end) and keeps the reason', () => {
    const next = txReducer(APPROVAL_REQUESTED, { type: 'SIGNATURE_REJECTED', message: 'user rejected' })
    expect(next.stage).toBe('idle')
    expect(next.error).toBe('user rejected')
    expect(canRequestSignature(next, 'approval')).toBe(true)
  })
})

describe('txReducer: receipt timeout and recovery', () => {
  it('RECEIPT_TIMEOUT only applies while actually confirming, never as a failure', () => {
    const confirming: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' }
    const timedOut = txReducer(confirming, { type: 'RECEIPT_TIMEOUT' })
    expect(timedOut.stage).toBe('receipt_check_required')
    // The hash is preserved so a direct check can still find it.
    expect(timedOut.hash).toBe('0xabc')

    // A timeout signal while idle (e.g. a late timer firing after RESET) is ignored.
    expect(txReducer(IDLE_ATTEMPT, { type: 'RECEIPT_TIMEOUT' })).toBe(IDLE_ATTEMPT)
  })

  it('a transaction that was already mined is recognized as successful after a timeout', () => {
    const stuck: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'receipt_check_required', hash: '0xabc' }
    const recovered = txReducer(stuck, { type: 'RECEIPT_RECOVERED', hash: '0xabc', success: true })
    expect(recovered.stage).toBe('approval_confirmed')
  })

  it('a genuinely reverted transaction is recognized as failed, not left hanging', () => {
    const stuck: TxAttempt = { ...IDLE_ATTEMPT, stage: 'receipt_check_required', kind: 'swap', hash: '0xfeed' }
    const recovered = txReducer(stuck, { type: 'RECEIPT_RECOVERED', hash: '0xfeed', success: false })
    expect(recovered.stage).toBe('failed')
  })

  it('a recovery result for a different (stale) hash is ignored', () => {
    const stuck: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'receipt_check_required', hash: '0xabc' }
    const result = txReducer(stuck, { type: 'RECEIPT_RECOVERED', hash: '0xOTHER', success: true })
    expect(result).toBe(stuck)
  })
})

describe('txReducer: reporting and reset', () => {
  it('REPORTING and REPORTED move a confirmed swap to success', () => {
    const swapConfirmed: TxAttempt = { ...IDLE_ATTEMPT, stage: 'swap_confirmed', kind: 'swap', hash: '0xfeed' }
    const reporting = txReducer(swapConfirmed, { type: 'REPORTING' })
    expect(reporting.stage).toBe('reporting')
    expect(txReducer(reporting, { type: 'REPORTED' }).stage).toBe('success')
  })

  it('RESET always returns to a clean idle attempt', () => {
    expect(txReducer(APPROVAL_REQUESTED, { type: 'RESET' })).toEqual(IDLE_ATTEMPT)
  })
})

// --- Recovery across a refresh or remount -----------------------------------

describe('saveAttempt / loadAttempt / clearSavedAttempt', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('persists a recoverable in-flight attempt and restores it as receipt_check_required', () => {
    const confirming: TxAttempt = { ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' }
    saveAttempt(confirming)
    const restored = loadAttempt()
    expect(restored).not.toBeNull()
    expect(restored?.hash).toBe('0xabc')
    expect(restored?.kind).toBe('approval')
    // Always comes back needing a fresh direct check: no watcher is assumed
    // to still be running for it after a reload/remount.
    expect(restored?.stage).toBe('receipt_check_required')
  })

  it('does not persist terminal or idle stages -- there is nothing to recover', () => {
    saveAttempt(IDLE_ATTEMPT)
    expect(loadAttempt()).toBeNull()

    const success: TxAttempt = { ...IDLE_ATTEMPT, stage: 'success', hash: '0xfeed' }
    saveAttempt(success)
    expect(loadAttempt()).toBeNull()
  })

  it('a stage without a hash is never persisted (nothing usable to check)', () => {
    const noHash: TxAttempt = { ...IDLE_ATTEMPT, stage: 'approval_submitted', kind: 'approval', hash: null }
    saveAttempt(noHash)
    expect(loadAttempt()).toBeNull()
  })

  it('clearSavedAttempt removes any recovered attempt', () => {
    saveAttempt({ ...APPROVAL_REQUESTED, stage: 'approval_confirming', hash: '0xabc' })
    clearSavedAttempt()
    expect(loadAttempt()).toBeNull()
  })
})
