// src/components/app/confirmAndSign.ts
// Confirm -> (build) -> switch chain -> approve if needed -> sign -> send.
//
// A route that spends an ERC20 needs the provider's spender approved before the
// swap can execute. The backend reads the real allowance and returns that
// approval with the transaction, so the wallet signs the approval first and the
// swap second, instead of paying gas for a revert.
//
// Approval and swap are separate functions (not one function that branches and
// recurses) so the caller's transaction state machine (txStateMachine.ts)
// always knows exactly which one is in flight, and a re-render or duplicate
// effect can never trigger the same signature twice: the reducer's own guard
// (canRequestSignature) is checked before either function is ever called.
import type { PublicClient } from 'viem'
import { parseEther, parseUnits } from 'viem'
import {
  intentService,
  IntentResponse,
  TransactionPayload,
  ApprovalPayload,
} from '../../services/intentService'
import { volumeFromQuote } from './constants'
import { readNativeBalance, resolveOutputToken, type OutputToken } from './settlement'

export type SettleSnapshot = {
  intentId: string
  toAmount: string
  toToken: string
  provider: string
  simulationPassed: boolean
  simulationReason?: string
  volumeUsd?: number
  // Same-chain only: a bridge's destination leg lands later, often on another
  // chain, so this receipt cannot prove what arrived there. See settlement.ts.
  sameChain: boolean
  recipient: string
  outputToken: OutputToken | null
  // Set only when recipient did not pay this transaction's own gas, so a
  // before/after native balance read is not contaminated by the gas spend.
  preNativeBalance?: bigint
}

function parseTxValue(raw: string): bigint {
  const v = raw || '0'
  if (v.startsWith('0x')) return BigInt(v)
  try {
    return parseEther(v)
  } catch {
    return parseUnits(v, 18)
  }
}

function buildGasParams(tx: TransactionPayload | ApprovalPayload): Record<string, any> {
  const g: Record<string, any> = {}
  if (tx.gas_limit && tx.gas_limit !== '0') g.gas = BigInt(tx.gas_limit)
  const full = tx as TransactionPayload
  if (full.max_fee_per_gas) g.maxFeePerGas = BigInt(full.max_fee_per_gas)
  if (full.max_priority_fee_per_gas) g.maxPriorityFeePerGas = BigInt(full.max_priority_fee_per_gas)
  return g
}

// --- Resolving what to sign --------------------------------------------------

export interface ResolveParams {
  result: IntentResponse
  selectedProvider: string
  currentTransaction: TransactionPayload | null
  approval: ApprovalPayload | null
  address: string
  destAddress: string
  chainId?: number
  switchChainAsync: (args: { chainId: number }) => Promise<any>
  setTxBuilding: (b: boolean) => void
  setCurrentTransaction: (t: TransactionPayload) => void
  setApproval: (a: ApprovalPayload | null) => void
  onToast: (message: string, kind: 'error' | 'loading' | 'success') => void
}

export interface ResolvedTx {
  tx: TransactionPayload
  approval: ApprovalPayload | null
}

/**
 * Ensures a freshly-built tx (and any approval) for the currently selected
 * quote, and switches network first if the wallet is on the wrong chain.
 * Returns null when the caller should stop (a build failed, or a network
 * switch was kicked off and confirm must be pressed again).
 */
export async function resolveTransactionForConfirm(p: ResolveParams): Promise<ResolvedTx | null> {
  const { result, selectedProvider } = p
  const selectedQuote = result.all_quotes.find(q => q.provider === selectedProvider) || result.quote

  let tx = p.currentTransaction
  let approval = p.approval
  if (!tx || selectedQuote.provider !== result.selected_provider) {
    if (selectedQuote.provider === result.selected_provider) {
      tx = result.transaction
      approval = result.approval || null
    } else {
      p.setTxBuilding(true)
      try {
        // A destination named in the command itself arrives on the result.
        const built = await intentService.buildTransaction(
          selectedQuote,
          p.address,
          p.destAddress || result.destination_address || undefined,
        )
        tx = built.transaction
        approval = built.approval || null
        p.setCurrentTransaction(built.transaction)
        p.setApproval(approval)
      } catch (e: any) {
        p.onToast(e.message || 'Failed to build transaction', 'error')
        p.setTxBuilding(false)
        return null
      }
      p.setTxBuilding(false)
    }
  }
  if (!tx || !tx.to) {
    p.onToast('Invalid transaction data', 'error')
    return null
  }

  if (p.chainId !== tx.chain_id) {
    try {
      p.onToast(`Switching network to ${tx.chain_name || 'required chain'}...`, 'loading')
      await p.switchChainAsync({ chainId: tx.chain_id })
      p.onToast('Network switched. Press Confirm again.', 'success')
    } catch (err: any) {
      p.onToast(err.message || 'Failed to switch network', 'error')
    }
    return null
  }

  return { tx, approval }
}

// --- Signing ------------------------------------------------------------------

export interface SignApprovalParams {
  approval: ApprovalPayload
  sendTransactionAsync: (args: any) => Promise<`0x${string}`>
}

/** Sends the ERC20 approval. Throws on rejection/failure; never sends the swap. */
export async function signApproval(p: SignApprovalParams): Promise<`0x${string}`> {
  return p.sendTransactionAsync({
    to: p.approval.to as `0x${string}`,
    data: p.approval.data as `0x${string}`,
    value: 0n,
    ...buildGasParams(p.approval),
  })
}

export interface SignSwapParams {
  tx: TransactionPayload
  result: IntentResponse
  selectedQuote: IntentResponse['quote']
  address: string
  destAddress: string
  publicClient?: PublicClient
  simulation: { passed: boolean; reason?: string }
  sendTransactionAsync: (args: any) => Promise<`0x${string}`>
  settleRef: { current: SettleSnapshot | null }
}

/** Sends the swap transaction. Snapshots what is being settled before signing. */
export async function signSwap(p: SignSwapParams): Promise<`0x${string}`> {
  const { tx, result, selectedQuote, address, destAddress } = p
  const sameChain = selectedQuote.from_chain === selectedQuote.to_chain
  const recipient = destAddress || result.destination_address || address
  let outputToken: OutputToken | null = null
  let preNativeBalance: bigint | undefined
  if (sameChain) {
    outputToken = await resolveOutputToken(selectedQuote).catch(() => null)
    if (outputToken?.native && p.publicClient && recipient.toLowerCase() !== address.toLowerCase()) {
      preNativeBalance = await readNativeBalance(p.publicClient, recipient).catch(() => undefined)
    }
  }
  p.settleRef.current = {
    intentId: result.intent_id,
    toAmount: selectedQuote.to_amount,
    toToken: selectedQuote.to_token,
    provider: selectedQuote.provider,
    simulationPassed: p.simulation.passed,
    simulationReason: p.simulation.reason,
    volumeUsd: volumeFromQuote(selectedQuote),
    sameChain,
    recipient,
    outputToken,
    preNativeBalance,
  }

  return p.sendTransactionAsync({
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    value: parseTxValue(tx.value),
    ...buildGasParams(tx),
  })
}
