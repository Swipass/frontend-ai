// src/components/app/useIntentExecution.test.ts
// Integration-level coverage of the transaction lifecycle across the hook:
// approval -> auto rebuild -> swap -> settlement, with the reducer's
// duplicate-submission guards exercised through the real orchestration code
// (handleConfirm, the auto-continue effect), not just in isolation.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor, cleanup } from '@testing-library/react'
import type { TransactionReceipt } from 'viem'

// --- Mocks -------------------------------------------------------------------

const mockSendTransactionAsync = vi.fn()
const receiptState: { data: TransactionReceipt | undefined; isLoading: boolean; isSuccess: boolean; isError: boolean } = {
  data: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
}

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useSendTransaction: () => ({ sendTransactionAsync: mockSendTransactionAsync, isPending: false }),
    usePublicClient: () => ({ getTransactionReceipt: vi.fn().mockResolvedValue(undefined) }),
    useWaitForTransactionReceipt: () => receiptState,
  }
})

vi.mock('../../hooks/useWallet', () => ({
  useWallet: () => ({
    address: '0xUser0000000000000000000000000000000000',
    isConnected: true,
    chainId: 42161,
    balance: '10',
    chainName: 'Arbitrum',
    connect: vi.fn(),
    disconnect: vi.fn(),
    switchChainAsync: vi.fn(),
  }),
}))

const mockExecute = vi.fn()
const mockBuildTransaction = vi.fn()
const mockReportStatus = vi.fn()
const mockGetChains = vi.fn()
const mockGetProviderRatings = vi.fn()
const mockGetStats = vi.fn()
const mockGetTransactions = vi.fn()
const mockGetTokens = vi.fn()

vi.mock('../../services/intentService', () => ({
  intentService: {
    execute: (...args: any[]) => mockExecute(...args),
    buildTransaction: (...args: any[]) => mockBuildTransaction(...args),
    getChains: (...args: any[]) => mockGetChains(...args),
    getProviderRatings: (...args: any[]) => mockGetProviderRatings(...args),
    getStats: (...args: any[]) => mockGetStats(...args),
    getTransactions: (...args: any[]) => mockGetTransactions(...args),
    getTokens: (...args: any[]) => mockGetTokens(...args),
    reportStatus: (...args: any[]) => mockReportStatus(...args),
  },
}))

const mockResolveOutputToken = vi.fn()
const mockReadNativeBalance = vi.fn()
const mockMeasureSettlement = vi.fn()
const mockVarianceBps = vi.fn()

vi.mock('./settlement', () => ({
  resolveOutputToken: (...args: any[]) => mockResolveOutputToken(...args),
  readNativeBalance: (...args: any[]) => mockReadNativeBalance(...args),
  measureSettlement: (...args: any[]) => mockMeasureSettlement(...args),
  varianceBps: (...args: any[]) => mockVarianceBps(...args),
}))

const mockToastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args: any[]) => mockToastError(...args),
    success: vi.fn(),
    loading: vi.fn(),
  },
}))

vi.mock('../../hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    isRecording: false,
    transcript: '',
    error: null,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}))

import { useIntentExecution } from './useIntentExecution'

// --- Fixtures ------------------------------------------------------------------

const APPROVAL = {
  to: '0xUSDT',
  data: '0xapprove',
  value: '0',
  gas_limit: '80000',
  chain_id: 42161,
  chain_name: 'Arbitrum',
  token_symbol: 'USDT',
  token_address: '0xUSDT',
  spender: '0xAugustus',
  amount: '2000000',
  current_allowance: '0',
  is_reset: false,
}

const SWAP_TX = {
  to: '0xAugustus',
  data: '0xswap',
  value: '0',
  gas_limit: '500000',
  chain_id: 42161,
  chain_name: 'Arbitrum',
  spender: '0xAugustus',
}

const QUOTE = {
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
}

function intentResult(overrides = {}) {
  return {
    intent_id: 'intent-1',
    parsed_intent: { to_chain: 'arbitrum' },
    selected_provider: 'paraswap',
    quote: QUOTE,
    transaction: SWAP_TX,
    all_quotes: [QUOTE],
    destination_note: 'Funds will be sent to the connected wallet',
    simulation_passed: true,
    approval: APPROVAL,
    requires_approval: true,
    ...overrides,
  }
}

async function submitCommand(result: { current: ReturnType<typeof useIntentExecution> }) {
  await waitFor(() => expect(result.current.chainsLoading).toBe(false))
  act(() => result.current.setCommand('Swap 2 usdt to eth'))
  await act(async () => {
    await result.current.handleSubmit()
  })
}

beforeEach(() => {
  // reset (not clear): a previous test's queued mockResolvedValueOnce chain
  // must not survive into the next test and get consumed by the wrong call.
  vi.resetAllMocks()
  sessionStorage.clear()
  receiptState.data = undefined
  receiptState.isLoading = false
  receiptState.isSuccess = false
  receiptState.isError = false
  mockReportStatus.mockResolvedValue(undefined)
  mockGetChains.mockResolvedValue([
    { key: 'arbitrum', name: 'Arbitrum', chain_id: 42161, explorer: 'https://arbiscan.io' },
  ])
  mockGetProviderRatings.mockResolvedValue([])
  mockGetStats.mockResolvedValue({})
  mockGetTransactions.mockResolvedValue([])
  mockGetTokens.mockResolvedValue({ tokens: [], total: 0 })
  mockResolveOutputToken.mockResolvedValue(null)
  mockReadNativeBalance.mockResolvedValue(0n)
  mockMeasureSettlement.mockResolvedValue(undefined)
  mockVarianceBps.mockReturnValue(undefined)
})

afterEach(() => {
  // Every test mounts a hook instance; without an explicit unmount its
  // effects (timers, the auto-continue watcher, etc.) keep running and can
  // leak into the next test through the module-level mocks.
  cleanup()
  vi.restoreAllMocks()
})

describe('approval required', () => {
  it('requests the approval signature with the token contract calldata, not the swap', async () => {
    mockExecute.mockResolvedValue(intentResult())
    mockSendTransactionAsync.mockResolvedValue('0xapprovalhash')

    const { result, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)
    expect(result.current.result?.requires_approval).toBe(true)

    await act(async () => {
      await result.current.handleConfirm()
    })

    expect(mockSendTransactionAsync).toHaveBeenCalledTimes(1)
    expect(mockSendTransactionAsync.mock.calls[0][0].to).toBe(APPROVAL.to)
    expect(mockSendTransactionAsync.mock.calls[0][0].data).toBe(APPROVAL.data)
    expect(result.current.txState.stage).toBe('approval_confirming')
    expect(result.current.txState.kind).toBe('approval')
    unmount()
  })

  it('approval cannot be submitted twice from a rapid double confirm', async () => {
    mockExecute.mockResolvedValue(intentResult())
    let resolveSend: (h: string) => void
    mockSendTransactionAsync.mockReturnValue(new Promise(res => (resolveSend = res)))

    const { result, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    // Fire two confirms back to back, before the first has resolved.
    await act(async () => {
      const p1 = result.current.handleConfirm()
      const p2 = result.current.handleConfirm()
      resolveSend!('0xapprovalhash-1')
      await Promise.all([p1, p2])
    })

    expect(mockSendTransactionAsync).toHaveBeenCalledTimes(1)
    unmount()
  })
})

describe('approval confirmed -> automatic rebuild and swap', () => {
  it('rebuilds the swap exactly once and requests the swap signature automatically', async () => {
    mockExecute.mockResolvedValue(intentResult())
    mockSendTransactionAsync.mockResolvedValueOnce('0xapprovalhash-2').mockResolvedValueOnce('0xswaphash-2')
    mockBuildTransaction.mockResolvedValue({
      transaction: SWAP_TX,
      approval: null,
      requires_approval: false,
      simulation_passed: true,
      simulation_reason: 'ok',
    })

    const { result, rerender, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    await act(async () => {
      await result.current.handleConfirm()
    })
    expect(result.current.txState.kind).toBe('approval')

    // The approval's receipt lands.
    receiptState.data = { status: 'success', transactionHash: '0xapprovalhash-2', logs: [] } as unknown as TransactionReceipt
    receiptState.isSuccess = true
    await act(async () => {
      rerender()
    })

    await waitFor(() => expect(mockBuildTransaction).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mockSendTransactionAsync).toHaveBeenCalledTimes(2))
    expect(mockSendTransactionAsync.mock.calls[1][0].to).toBe(SWAP_TX.to)
    expect(result.current.txState.kind).toBe('swap')

    // The rebuild is not repeated on further re-renders of the same confirmed hash.
    await act(async () => {
      rerender()
    })
    expect(mockBuildTransaction).toHaveBeenCalledTimes(1)
    unmount()
  })
})

describe('swap confirmed -> settlement reporting', () => {
  it('reports settlement exactly once after the swap receipt lands', async () => {
    mockExecute.mockResolvedValue(intentResult({ approval: null, requires_approval: false }))
    mockSendTransactionAsync.mockResolvedValue('0xswaphash-3')

    const { result, rerender, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    await act(async () => {
      await result.current.handleConfirm()
    })
    expect(result.current.txState.kind).toBe('swap')

    receiptState.data = { status: 'success', transactionHash: '0xswaphash-3', logs: [] } as unknown as TransactionReceipt
    receiptState.isSuccess = true
    await act(async () => {
      rerender()
    })

    await waitFor(() => expect(result.current.txState.stage).toBe('success'))
    expect(mockReportStatus).toHaveBeenCalledTimes(1)
    expect(mockReportStatus.mock.calls[0][0]).toBe('intent-1')
    expect(mockReportStatus.mock.calls[0][1]).toBe('0xswaphash-3')
    expect(mockReportStatus.mock.calls[0][2]).toBe('completed')
    unmount()
  })
})

describe('reverted receipts', () => {
  it('an approval revert never triggers the swap rebuild', async () => {
    mockExecute.mockResolvedValue(intentResult())
    mockSendTransactionAsync.mockResolvedValue('0xapprovalhash-4')

    const { result, rerender, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    await act(async () => {
      await result.current.handleConfirm()
    })

    receiptState.data = { status: 'reverted', transactionHash: '0xapprovalhash-4', logs: [] } as unknown as TransactionReceipt
    receiptState.isSuccess = true
    await act(async () => {
      rerender()
    })

    await waitFor(() => expect(result.current.txState.stage).toBe('failed'))
    expect(mockBuildTransaction).not.toHaveBeenCalled()
    expect(mockReportStatus).not.toHaveBeenCalled()
    unmount()
  })

  it('a swap revert does not report success', async () => {
    mockExecute.mockResolvedValue(intentResult({ approval: null, requires_approval: false }))
    mockSendTransactionAsync.mockResolvedValue('0xswaphash-5')

    const { result, rerender, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    await act(async () => {
      await result.current.handleConfirm()
    })

    receiptState.data = { status: 'reverted', transactionHash: '0xswaphash-5', logs: [] } as unknown as TransactionReceipt
    receiptState.isSuccess = true
    await act(async () => {
      rerender()
    })

    await waitFor(() => expect(result.current.txState.stage).toBe('failed'))
    expect(mockReportStatus).not.toHaveBeenCalledWith('intent-1', '0xswaphash-5', 'completed', expect.anything())
    unmount()
  })
})

describe('wallet rejection', () => {
  it('produces an immediately actionable idle state, not a dead end', async () => {
    mockExecute.mockResolvedValue(intentResult())
    mockSendTransactionAsync.mockRejectedValue(new Error('User rejected the request'))

    const { result, unmount } = renderHook(() => useIntentExecution())
    await submitCommand(result)

    await act(async () => {
      await result.current.handleConfirm()
    })

    expect(result.current.txState.stage).toBe('idle')
    expect(result.current.isConfirming).toBe(false)
    unmount()
  })
})

describe('remount recovery', () => {
  it('a fresh mount recognizes a pending approval instead of starting over', async () => {
    mockExecute.mockResolvedValue(intentResult())
    mockSendTransactionAsync.mockResolvedValue('0xapprovalhash')

    const first = renderHook(() => useIntentExecution())
    await submitCommand(first.result)
    await act(async () => {
      await first.result.current.handleConfirm()
    })
    expect(first.result.current.txState.hash).toBe('0xapprovalhash')
    first.unmount()

    // A brand new hook instance (simulating a remount) picks up the
    // persisted attempt instead of defaulting to idle.
    const second = renderHook(() => useIntentExecution())
    expect(second.result.current.txState.hash).toBe('0xapprovalhash')
    expect(second.result.current.txState.stage).toBe('receipt_check_required')
    second.unmount()
  })
})
