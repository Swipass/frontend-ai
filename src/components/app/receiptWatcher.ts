// src/components/app/receiptWatcher.ts
// Bounded, recoverable wrapper around wagmi's useWaitForTransactionReceipt.
//
// The bug this fixes: useWaitForTransactionReceipt polls the RPC endpoint
// wagmi was configured with (sourced from the backend's /v1/chains), not the
// wallet's own view of the chain. If that endpoint is slow, briefly
// inconsistent, or rate-limited, the hook can sit in isLoading forever with
// no timeout of its own -- the transaction is really mined (the wallet and a
// block explorer both show it), but this app never finds out, so the UI
// never leaves "Processing...".
//
// This keeps using the wagmi hook (it is the right tool and requires no new
// infrastructure) but adds a soft timeout: after it, the caller is told to
// stop waiting passively and offer a direct check instead, using the same
// publicClient the app already has (see measureSettlement in settlement.ts)
// rather than a second bespoke RPC client. A timeout is never treated as a
// failure -- only an actual reverted receipt is.
import { useEffect, useRef, useState, useCallback } from 'react'
import { useWaitForTransactionReceipt, type UseWaitForTransactionReceiptReturnType } from 'wagmi'
import type { PublicClient, TransactionReceipt } from 'viem'

const SOFT_TIMEOUT_MS = 30_000

export interface ReceiptWatcherState {
  receipt: TransactionReceipt | undefined
  isLoading: boolean
  isSuccess: boolean
  timedOut: boolean
  /** Ask the chain directly for this hash's receipt, bypassing the stalled poll. */
  checkNow: () => Promise<TransactionReceipt | null>
}

export function useReceiptWatcher(
  hash: string | undefined,
  publicClient: PublicClient | undefined,
): ReceiptWatcherState {
  const wait: UseWaitForTransactionReceiptReturnType = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  })
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setTimedOut(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!hash) return
    timerRef.current = setTimeout(() => setTimedOut(true), SOFT_TIMEOUT_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hash])

  // The hook resolving on its own (success either way) cancels the timeout
  // state, so a slow-but-eventually-fine poll never shows a stale warning.
  useEffect(() => {
    if (wait.isSuccess || wait.isError) setTimedOut(false)
  }, [wait.isSuccess, wait.isError])

  const checkNow = useCallback(async (): Promise<TransactionReceipt | null> => {
    if (!hash || !publicClient) return null
    try {
      return await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` })
    } catch {
      // Not mined yet (or the RPC still can't see it): a real "no receipt
      // yet" is not a failure, it just means the manual check found nothing
      // to report this time.
      return null
    }
  }, [hash, publicClient])

  return {
    receipt: wait.data,
    isLoading: wait.isLoading,
    isSuccess: wait.isSuccess,
    timedOut,
    checkNow,
  }
}
