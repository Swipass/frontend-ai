// src/components/app/settlement.ts
// Reads what actually settled on-chain, so "truth-return" (quoted vs. executed)
// reports a real measured amount instead of echoing the quote back at itself.
//
// Same-chain only: a bridge's destination leg lands on another chain, often
// minutes later, and this receipt only proves the source-chain transaction
// executed. Reporting a same-chain balance read as the outcome of a bridge
// would be worse than reporting nothing, so bridges settle with no measured
// amount until a destination-chain watcher exists (see docs/security-model.md).
import { decodeEventLog, formatUnits, type Log, type PublicClient } from 'viem'
import { intentService, type QuoteResponse } from '../../services/intentService'

const TRANSFER_EVENT = {
  type: 'event',
  name: 'Transfer',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const

export interface OutputToken {
  address: string
  decimals: number
  native: boolean
}

/** The exact token this quote pays out, resolved from the real chain registry. */
export async function resolveOutputToken(quote: QuoteResponse): Promise<OutputToken | null> {
  try {
    const page = await intentService.getTokens(quote.to_chain, quote.to_token, 5)
    const match = page.tokens.find(t => t.symbol.toUpperCase() === quote.to_token.toUpperCase())
    return match ? { address: match.address, decimals: match.decimals, native: match.native } : null
  } catch {
    return null
  }
}

/**
 * The real amount an ERC20 Transfer log shows landing at `recipient`, decoded
 * straight from the transaction receipt already in hand (no extra RPC calls,
 * so it is exact and cannot be fooled by a balance that moved for any other
 * reason). Null when no matching transfer is in the receipt.
 */
export function readErc20Settlement(logs: readonly Log[], tokenAddress: string, recipient: string, decimals: number): string | null {
  const token = tokenAddress.toLowerCase()
  const to = recipient.toLowerCase()
  let total = 0n
  for (const log of logs) {
    if (log.address.toLowerCase() !== token) continue
    try {
      const decoded = decodeEventLog({ abi: [TRANSFER_EVENT], data: log.data, topics: log.topics })
      if ((decoded.args.to as string).toLowerCase() === to) {
        total += decoded.args.value as bigint
      }
    } catch {
      // Not a Transfer log (or a non-standard one); ignore rather than guess.
    }
  }
  return total > 0n ? formatUnits(total, decimals) : null
}

/**
 * The real native-asset amount `recipient` gained, by reading its balance
 * immediately before the transaction is sent and again once the receipt
 * lands. Only meaningful when `recipient` did not itself pay this
 * transaction's gas (otherwise the gas spend contaminates the delta), which
 * callers must check before using either half of this pair.
 */
export async function readNativeBalance(publicClient: PublicClient, address: string): Promise<bigint> {
  return publicClient.getBalance({ address: address as `0x${string}` })
}

export function nativeSettlement(before: bigint, after: bigint, decimals: number): string | null {
  const delta = after - before
  return delta > 0n ? formatUnits(delta, decimals) : null
}

// The receipt: Swipass's core promise made visible on every settled intent,
// not a buried analytics field. Quoted vs. executed, in the open, every time.
export interface SettlementReceipt {
  quotedToAmount: string
  toToken: string
  actualToAmount?: string
  varianceBps?: number
  provider: string
  simulationPassed: boolean
  simulationReason?: string
  settlement: 'confirmed' | 'pending'
}

/** (actual/quoted - 1) in basis points, matching the backend's own formula exactly. */
export function varianceBps(quoted: string, actual: string): number | null {
  const q = Number(quoted)
  const a = Number(actual)
  if (!isFinite(q) || q <= 0 || !isFinite(a)) return null
  return Math.round((a / q - 1) * 10000)
}

/** Minimal shape `measureSettlement` needs from a settle snapshot. */
export interface SettleMeasurement {
  sameChain: boolean
  recipient: string
  outputToken: OutputToken | null
  preNativeBalance?: bigint
}

/**
 * What actually settled, or undefined when that cannot be honestly measured
 * (a bridge's destination leg, or a native payout to the address that itself
 * paid this transaction's gas). Never falls back to the quoted amount: an
 * unmeasured outcome must report as unmeasured, not as a match.
 */
export async function measureSettlement(
  snap: SettleMeasurement,
  logs: readonly Log[],
  publicClient: PublicClient | undefined,
): Promise<string | undefined> {
  if (!snap.sameChain || !snap.outputToken) return undefined
  if (snap.outputToken.native) {
    if (snap.preNativeBalance === undefined || !publicClient) return undefined
    const after = await readNativeBalance(publicClient, snap.recipient).catch(() => undefined)
    if (after === undefined) return undefined
    return nativeSettlement(snap.preNativeBalance, after, snap.outputToken.decimals) ?? undefined
  }
  return readErc20Settlement(logs, snap.outputToken.address, snap.recipient, snap.outputToken.decimals) ?? undefined
}
