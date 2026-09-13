// src/components/app/confirmAndSign.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signApproval, signSwap, resolveTransactionForConfirm, type SettleSnapshot } from './confirmAndSign'
import type { ApprovalPayload, TransactionPayload, IntentResponse, QuoteResponse } from '../../services/intentService'

vi.mock('../../services/intentService', () => ({
  intentService: { buildTransaction: vi.fn() },
}))
vi.mock('./settlement', () => ({
  resolveOutputToken: vi.fn().mockResolvedValue(null),
  readNativeBalance: vi.fn().mockResolvedValue(0n),
}))

import { intentService } from '../../services/intentService'

const APPROVAL: ApprovalPayload = {
  to: '0xTokenContract',
  data: '0xapprovecalldata',
  value: '0',
  gas_limit: '80000',
  chain_id: 42161,
  chain_name: 'Arbitrum',
  token_symbol: 'USDT',
  token_address: '0xTokenContract',
  spender: '0xAugustus',
  amount: '2000000',
  current_allowance: '0',
  is_reset: false,
}

const SWAP_TX: TransactionPayload = {
  to: '0xAugustus',
  data: '0xswapcalldata',
  value: '0',
  gas_limit: '500000',
  chain_id: 42161,
  chain_name: 'Arbitrum',
  spender: '0xAugustus',
}

function makeQuote(overrides: Partial<QuoteResponse> = {}): QuoteResponse {
  return {
    provider: 'paraswap',
    from_chain: 'arbitrum',
    to_chain: 'arbitrum',
    from_token: 'USDT',
    to_token: 'ETH',
    from_amount: '2',
    to_amount: '0.0008',
    guaranteed_to_amount: '0.00079',
    fee_amount: '0',
    fee_token: 'ETH',
    estimated_time_seconds: 30,
    estimated_gas_usd: '0.5',
    price_impact_percent: '0.1',
    score: 95.3,
    quote_id: 'q1',
    ...overrides,
  }
}

function makeResult(overrides: Partial<IntentResponse> = {}): IntentResponse {
  const quote = makeQuote()
  return {
    intent_id: 'intent-1',
    parsed_intent: {},
    selected_provider: 'paraswap',
    quote,
    transaction: SWAP_TX,
    all_quotes: [quote],
    destination_note: 'Funds will be sent to the connected wallet',
    simulation_passed: true,
    approval: APPROVAL,
    requires_approval: true,
    ...overrides,
  }
}

describe('signApproval', () => {
  it('sends exactly the approval calldata to the token contract, never the swap', async () => {
    const sendTransactionAsync = vi.fn().mockResolvedValue('0xapprovalhash')
    const hash = await signApproval({ approval: APPROVAL, sendTransactionAsync })

    expect(hash).toBe('0xapprovalhash')
    expect(sendTransactionAsync).toHaveBeenCalledTimes(1)
    const call = sendTransactionAsync.mock.calls[0][0]
    expect(call.to).toBe(APPROVAL.to)
    expect(call.data).toBe(APPROVAL.data)
    expect(call.value).toBe(0n)
    expect(call.gas).toBe(80000n)
  })

  it('propagates a wallet rejection instead of swallowing it', async () => {
    const sendTransactionAsync = vi.fn().mockRejectedValue(new Error('User rejected the request'))
    await expect(signApproval({ approval: APPROVAL, sendTransactionAsync })).rejects.toThrow(
      'User rejected the request',
    )
  })
})

describe('signSwap', () => {
  it('sends the swap calldata and snapshots what is being settled before signing', async () => {
    const sendTransactionAsync = vi.fn().mockResolvedValue('0xswaphash')
    const settleRef: { current: SettleSnapshot | null } = { current: null }
    const result = makeResult()
    const quote = result.quote

    const hash = await signSwap({
      tx: SWAP_TX,
      result,
      selectedQuote: quote,
      address: '0xUser',
      destAddress: '',
      publicClient: undefined,
      simulation: { passed: true },
      sendTransactionAsync,
      settleRef,
    })

    expect(hash).toBe('0xswaphash')
    const call = sendTransactionAsync.mock.calls[0][0]
    expect(call.to).toBe(SWAP_TX.to)
    expect(call.data).toBe(SWAP_TX.data)

    expect(settleRef.current).not.toBeNull()
    expect(settleRef.current?.intentId).toBe('intent-1')
    expect(settleRef.current?.provider).toBe('paraswap')
    expect(settleRef.current?.recipient).toBe('0xUser')
  })

  it('propagates a wallet rejection and still leaves nothing sent', async () => {
    const sendTransactionAsync = vi.fn().mockRejectedValue(new Error('User rejected the request'))
    const settleRef: { current: SettleSnapshot | null } = { current: null }
    const result = makeResult()

    await expect(
      signSwap({
        tx: SWAP_TX,
        result,
        selectedQuote: result.quote,
        address: '0xUser',
        destAddress: '',
        publicClient: undefined,
        simulation: { passed: true },
        sendTransactionAsync,
        settleRef,
      }),
    ).rejects.toThrow('User rejected the request')
  })
})

describe('resolveTransactionForConfirm', () => {
  beforeEach(() => {
    vi.mocked(intentService.buildTransaction).mockReset()
  })

  it('reuses the already-built transaction for the backend-selected provider without rebuilding', async () => {
    const result = makeResult()
    const resolved = await resolveTransactionForConfirm({
      result,
      selectedProvider: 'paraswap',
      currentTransaction: SWAP_TX,
      approval: APPROVAL,
      address: '0xUser',
      destAddress: '',
      chainId: 42161,
      switchChainAsync: vi.fn(),
      setTxBuilding: vi.fn(),
      setCurrentTransaction: vi.fn(),
      setApproval: vi.fn(),
      onToast: vi.fn(),
    })

    expect(resolved).toEqual({ tx: SWAP_TX, approval: APPROVAL })
    expect(intentService.buildTransaction).not.toHaveBeenCalled()
  })

  it('rebuilds via the backend when a different provider is selected, and never reuses the prior spender/approval', async () => {
    const oneInchQuote = makeQuote({ provider: '1inch', quote_id: 'q2' })
    const result = makeResult({ all_quotes: [makeQuote(), oneInchQuote] })
    const oneInchTx: TransactionPayload = { ...SWAP_TX, to: '0x1inchRouter', spender: '0x1inchSpender' }
    const oneInchApproval: ApprovalPayload = { ...APPROVAL, spender: '0x1inchSpender' }
    vi.mocked(intentService.buildTransaction).mockResolvedValue({
      transaction: oneInchTx,
      approval: oneInchApproval,
      requires_approval: true,
      simulation_passed: true,
      simulation_reason: 'ok',
    })

    const setCurrentTransaction = vi.fn()
    const setApproval = vi.fn()
    const resolved = await resolveTransactionForConfirm({
      result,
      selectedProvider: '1inch',
      currentTransaction: SWAP_TX, // stale: still the paraswap tx from before selection changed
      approval: APPROVAL, // stale: paraswap's spender
      address: '0xUser',
      destAddress: '',
      chainId: 42161,
      switchChainAsync: vi.fn(),
      setTxBuilding: vi.fn(),
      setCurrentTransaction,
      setApproval,
      onToast: vi.fn(),
    })

    expect(intentService.buildTransaction).toHaveBeenCalledWith(oneInchQuote, '0xUser', undefined)
    expect(resolved?.tx.to).toBe('0x1inchRouter')
    expect(resolved?.approval?.spender).toBe('0x1inchSpender')
    // The component's own state is updated to the freshly built values too.
    expect(setCurrentTransaction).toHaveBeenCalledWith(oneInchTx)
    expect(setApproval).toHaveBeenCalledWith(oneInchApproval)
  })

  it('switches network and stops (returns null) instead of signing on the wrong chain', async () => {
    const result = makeResult()
    const switchChainAsync = vi.fn().mockResolvedValue(undefined)
    const resolved = await resolveTransactionForConfirm({
      result,
      selectedProvider: 'paraswap',
      currentTransaction: SWAP_TX,
      approval: APPROVAL,
      address: '0xUser',
      destAddress: '',
      chainId: 1, // wrong chain: the tx needs 42161
      switchChainAsync,
      setTxBuilding: vi.fn(),
      setCurrentTransaction: vi.fn(),
      setApproval: vi.fn(),
      onToast: vi.fn(),
    })

    expect(resolved).toBeNull()
    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: 42161 })
  })

  it('reports the error and returns null when the backend build fails', async () => {
    const oneInchQuote = makeQuote({ provider: '1inch', quote_id: 'q2' })
    const result = makeResult({ all_quotes: [makeQuote(), oneInchQuote] })
    vi.mocked(intentService.buildTransaction).mockRejectedValue(new Error('build failed'))
    const onToast = vi.fn()

    const resolved = await resolveTransactionForConfirm({
      result,
      selectedProvider: '1inch',
      currentTransaction: null,
      approval: null,
      address: '0xUser',
      destAddress: '',
      chainId: 42161,
      switchChainAsync: vi.fn(),
      setTxBuilding: vi.fn(),
      setCurrentTransaction: vi.fn(),
      setApproval: vi.fn(),
      onToast,
    })

    expect(resolved).toBeNull()
    expect(onToast).toHaveBeenCalledWith('build failed', 'error')
  })
})
