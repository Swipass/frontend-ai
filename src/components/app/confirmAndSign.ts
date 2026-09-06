// src/components/app/confirmAndSign.ts
// Confirm -> (build) -> switch chain -> approve if needed -> sign -> send.
// Extracted from the hook so the state machine stays readable. Talks back
// through the passed setters.
//
// A route that spends an ERC20 needs the provider's spender approved before the
// swap can execute. The backend reads the real allowance and returns that
// approval with the transaction, so the wallet signs the approval first and the
// swap second, instead of paying gas for a revert.
import type { MutableRefObject } from 'react'
import toast from 'react-hot-toast'
import { parseEther, parseUnits } from 'viem'
import {
  intentService,
  IntentResponse,
  TransactionPayload,
  ApprovalPayload,
} from '../../services/intentService'
import { volumeFromQuote } from './constants'

export type SettleSnapshot = { intentId: string; toAmount: string; volumeUsd?: number }
export type TxKind = 'approval' | 'swap'

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

interface ConfirmParams {
  result: IntentResponse
  address: string
  selectedProvider: string
  currentTransaction: TransactionPayload | null
  approval: ApprovalPayload | null
  destAddress: string
  chainId?: number
  switchChainAsync: (args: { chainId: number }) => Promise<any>
  sendTransactionAsync: (args: any) => Promise<`0x${string}`>
  settleRef: MutableRefObject<SettleSnapshot | null>
  txKindRef: MutableRefObject<TxKind>
  setTxBuilding: (b: boolean) => void
  setCurrentTransaction: (t: TransactionPayload) => void
  setApproval: (a: ApprovalPayload | null) => void
  setConfirming: (b: boolean) => void
  setTxHash: (h: string) => void
  onFail: () => void
}

export async function confirmAndSign(p: ConfirmParams) {
  const { result, address, selectedProvider, destAddress } = p
  const selectedQuote = result.all_quotes.find(q => q.provider === selectedProvider) || result.quote

  // Ensure a freshly-built tx for the selected quote at confirm time.
  let tx = p.currentTransaction
  let approval = p.approval
  if (!tx || selectedQuote.provider !== result.selected_provider) {
    if (selectedQuote.provider === result.selected_provider) {
      tx = result.transaction
      approval = result.approval || null
    } else {
      p.setTxBuilding(true)
      try {
        const built = await intentService.buildTransaction(
          selectedQuote,
          address,
          destAddress || undefined,
        )
        tx = built.transaction
        approval = built.approval || null
        p.setCurrentTransaction(built.transaction)
        p.setApproval(approval)
      } catch (e: any) {
        toast.error(e.message || 'Failed to build transaction')
        p.setTxBuilding(false)
        return
      }
      p.setTxBuilding(false)
    }
  }
  if (!tx || !tx.to) {
    toast.error('Invalid transaction data')
    return
  }

  if (p.chainId !== tx.chain_id) {
    try {
      toast.loading(`Switching network to ${tx.chain_name || 'required chain'}...`, { id: 'switch' })
      await p.switchChainAsync({ chainId: tx.chain_id })
      toast.success('Network switched. Press Confirm again.', { id: 'switch' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch network', { id: 'switch' })
    }
    return
  }

  // Step one of two: grant the allowance this route needs.
  if (approval) {
    p.setConfirming(true)
    p.txKindRef.current = 'approval'
    try {
      const hash = await p.sendTransactionAsync({
        to: approval.to as `0x${string}`,
        data: approval.data as `0x${string}`,
        value: 0n,
        ...buildGasParams(approval),
      })
      p.setTxHash(hash)
      const label = approval.is_reset
        ? `Resetting the ${approval.token_symbol} allowance...`
        : `Approving ${approval.token_symbol}...`
      toast.loading(label, { id: 'tx' })
    } catch (err: any) {
      toast.error(err.message || 'Approval rejected')
      p.setConfirming(false)
    }
    return
  }

  p.setConfirming(true)
  p.txKindRef.current = 'swap'
  try {
    // Snapshot what we're settling before the async signature round-trip.
    p.settleRef.current = {
      intentId: result.intent_id,
      toAmount: selectedQuote.to_amount,
      volumeUsd: volumeFromQuote(selectedQuote),
    }
    const hash = await p.sendTransactionAsync({
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
      value: parseTxValue(tx.value),
      ...buildGasParams(tx),
    })
    p.setTxHash(hash)
    toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'tx' })
  } catch (err: any) {
    toast.error(err.message || 'Transaction failed')
    p.setConfirming(false)
    p.onFail()
  }
}
