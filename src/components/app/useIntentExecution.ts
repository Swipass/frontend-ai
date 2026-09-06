// src/components/app/useIntentExecution.ts
// Owns the full transaction state machine for the app command center:
//   submit -> quotes -> select provider -> confirm -> sign -> settle -> report.
// AppPage and the layout components are thin consumers of this hook.
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import {
  intentService,
  IntentResponse,
  QuoteResponse,
  TransactionPayload,
  ApprovalPayload,
  ProviderRating,
  ChainInfo,
} from '../../services/intentService'
import { useAppStore } from '../../store/appStore'
import { useWallet } from '../../hooks/useWallet'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { buildQuickCommands, capitalize, MOBILE_BREAKPOINT, MobileTab } from './constants'
import { confirmAndSign, SettleSnapshot, TxKind } from './confirmAndSign'

export function useIntentExecution() {
  const { commandHistory: sessionCommands, addCommand, updateCommand } = useAppStore()
  const [walletHistory, setWalletHistory] = useState<any[]>([])
  const { address, isConnected, chainName, balance, chainId, connect, disconnect, switchChainAsync } =
    useWallet()

  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IntentResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [fromChainIdx, setFromChainIdx] = useState(0)
  const [destAddress, setDestAddress] = useState('')
  const [showDestInput, setShowDestInput] = useState(false)
  const [histId, setHistId] = useState<string | null>(null)
  const [chains, setChains] = useState<ChainInfo[]>([])
  const [chainsLoading, setChainsLoading] = useState(true)

  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPayload | null>(null)
  // The ERC20 approval this route needs before it can execute, if any.
  const [approval, setApproval] = useState<ApprovalPayload | null>(null)
  const [txBuilding, setTxBuilding] = useState(false)
  const [ratings, setRatings] = useState<ProviderRating[]>([])
  const [feeInfo, setFeeInfo] = useState<{ direct?: string; developer?: string }>({})
  const [tokens, setTokens] = useState<string[]>([])
  const [tokenTotal, setTokenTotal] = useState(0)
  const [tokenQuery, setTokenQuery] = useState('')

  const [mobileTab, setMobileTab] = useState<MobileTab>('command')
  const [isMobile, setIsMobile] = useState(false)
  const [pendingWarning, setPendingWarning] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const settleRef = useRef<SettleSnapshot | null>(null)
  // Which of the two possible signatures is in flight, so the receipt handler
  // knows whether an approval just landed or the swap itself settled.
  const txKindRef = useRef<TxKind>('swap')

  const { isRecording, transcript, error: voiceError, startRecording, stopRecording } =
    useVoiceInput()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const { data: receipt, isLoading: isWaiting, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash: txHash as `0x${string}` })

  // Responsive breakpoint (mobile / tablet single-column below 900px).
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Chains, provider ratings and the real fee rates come from the backend
  // (no hardcoded fallbacks).
  useEffect(() => {
    intentService.getChains().then(setChains).catch(() => setChains([])).finally(() => setChainsLoading(false))
    intentService.getProviderRatings().then(setRatings).catch(() => setRatings([]))
    intentService
      .getStats()
      .then(s => setFeeInfo({ direct: s.fee_rate_direct, developer: s.fee_rate_developer }))
      .catch(() => setFeeInfo({}))
  }, [])

  // The connected wallet's real transaction history (backend, wallet-scoped).
  // Empty when no wallet is connected. This is the source for the history panel.
  const fetchWalletHistory = useCallback(async () => {
    if (!isConnected || !address) {
      setWalletHistory([])
      return
    }
    try {
      const txs = await intentService.getTransactions(address)
      setWalletHistory(
        txs.map((t: any) => ({
          id: t.id,
          command: t.command,
          fromChain: t.from_chain ? capitalize(t.from_chain) : '',
          toChain: t.to_chain ? capitalize(t.to_chain) : '',
          status: t.status,
          txHash: t.tx_hash || undefined,
          volumeUsd: t.volume_usd ?? undefined,
        })),
      )
    } catch {
      setWalletHistory([])
    }
  }, [isConnected, address])

  useEffect(() => {
    fetchWalletHistory()
  }, [fetchWalletHistory])

  // Provider-derived tokens for the selected source chain (from /v1/tokens).
  // A chain carries hundreds to thousands of tokens, so the backend filters and
  // pages: we show the first page and search it as the user types. Debounced so
  // a fast typist makes one request, not one per keystroke.
  useEffect(() => {
    const key = chains[fromChainIdx]?.key
    if (!key) {
      setTokens([])
      setTokenTotal(0)
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      intentService
        .getTokens(key, tokenQuery || undefined, 40)
        .then(page => {
          if (cancelled) return
          setTokens(page.tokens.map(t => t.symbol))
          setTokenTotal(page.total)
        })
        .catch(() => {
          if (cancelled) return
          setTokens([])
          setTokenTotal(0)
        })
    }, tokenQuery ? 200 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [chains, fromChainIdx, tokenQuery])

  useEffect(() => {
    if (voiceError) toast.error(`Voice: ${voiceError}`)
  }, [voiceError])
  useEffect(() => {
    if (transcript) setCommand(transcript)
  }, [transcript])

  useEffect(() => {
    if (isWaiting && txHash) {
      setPendingWarning(false)
      const timer = setTimeout(() => setPendingWarning(true), 30_000)
      return () => clearTimeout(timer)
    }
  }, [isWaiting, txHash])

  // Build the signable transaction (and any approval) for a quote.
  const buildForQuote = useCallback(
    async (quote: QuoteResponse) => {
      if (!address) return
      const built = await intentService.buildTransaction(quote, address, destAddress || undefined)
      setCurrentTransaction(built.transaction)
      setApproval(built.approval || null)
      return built
    },
    [address, destAddress],
  )

  // Settle: reconcile on-chain outcome, record volume, report to analytics.
  // An approval receipt is not a settlement: it unlocks the swap, so we re-build
  // (the allowance has changed, and some tokens need a reset first) and hand the
  // user back to Confirm for the transaction itself.
  useEffect(() => {
    if (!(txSuccess && receipt && histId)) return

    if (txKindRef.current === 'approval') {
      setTxHash('')
      setConfirming(false)
      const selectedQuote =
        result?.all_quotes.find(q => q.provider === selectedProvider) || result?.quote
      if (selectedQuote) {
        buildForQuote(selectedQuote)
          .then(built => {
            toast.success(
              built?.requires_approval
                ? 'Allowance reset. Confirm again to approve the amount.'
                : 'Approved. Confirm to sign the transaction.',
              { id: 'tx' },
            )
          })
          .catch(() => toast.success('Approved. Confirm to sign the transaction.', { id: 'tx' }))
      }
      return
    }

    const snap = settleRef.current
    if (receipt.status === 'success') {
      updateCommand(histId, { status: 'completed', txHash: receipt.transactionHash, volumeUsd: snap?.volumeUsd })
      if (snap)
        intentService.reportStatus(snap.intentId, receipt.transactionHash, 'completed', snap.toAmount).catch(() => {})
      setShowSuccess(true)
      toast.success('Transaction settled!')
    } else {
      updateCommand(histId, { status: 'failed' })
      if (snap) intentService.reportStatus(snap.intentId, receipt.transactionHash, 'failed').catch(() => {})
      toast.error('Transaction reverted on-chain')
    }
    setConfirming(false)
    // Refresh the wallet's real history from the backend after settlement.
    fetchWalletHistory()
  }, [
    txSuccess,
    receipt,
    histId,
    updateCommand,
    fetchWalletHistory,
    result,
    selectedProvider,
    buildForQuote,
  ])

  const handleNetworkSwitch = useCallback(
    async (idx: number) => {
      const targetChainId = chains[idx]?.chain_id
      if (targetChainId && switchChainAsync && targetChainId !== chainId) {
        try {
          await switchChainAsync({ chainId: targetChainId })
        } catch (err: any) {
          toast.error(err.message || 'Failed to switch network')
        }
      }
      setFromChainIdx(idx)
    },
    [chains, switchChainAsync, chainId],
  )

  // Build the signable tx for a quote (threads the optional destination).
  const fetchTransactionForQuote = useCallback(
    async (quote: QuoteResponse) => {
      if (!address) return
      setTxBuilding(true)
      try {
        await buildForQuote(quote)
      } catch (e: any) {
        toast.error(e.message || 'Failed to build transaction')
      } finally {
        setTxBuilding(false)
      }
    },
    [address, buildForQuote],
  )

  const handleSelectProvider = useCallback(
    (providerName: string) => {
      if (!result) return
      const selectedQuote = result.all_quotes.find(q => q.provider === providerName)
      if (!selectedQuote) return
      setSelectedProvider(providerName)
      if (selectedQuote.provider === result.selected_provider) {
        setCurrentTransaction(result.transaction)
        setApproval(result.approval || null)
      } else {
        fetchTransactionForQuote(selectedQuote)
      }
    },
    [result, fetchTransactionForQuote],
  )

  // Default to the backend-selected provider (no hardcoded 'lifi').
  useEffect(() => {
    if (!result) return
    const defaultQuote =
      result.all_quotes.find(q => q.provider === result.selected_provider) || result.all_quotes[0]
    if (defaultQuote) handleSelectProvider(defaultQuote.provider)
  }, [result, handleSelectProvider])

  const handleSubmit = useCallback(async () => {
    if (!command.trim() || loading || chainsLoading) return
    setLoading(true)
    setResult(null)
    setCurrentTransaction(null)
    setApproval(null)
    if (isMobile) setMobileTab('command')

    const fromChainObj = chains[fromChainIdx]
    const fromChainKey = fromChainObj?.key || 'ethereum'
    const id = addCommand({
      command: command.trim(),
      fromChain: fromChainObj?.name || capitalize(fromChainKey),
      toChain: '',
      status: 'pending',
    })
    setHistId(id)

    try {
      const headers = address ? { 'X-Wallet-Address': address } : undefined
      const res = await intentService.execute(
        {
          command: command.trim(),
          destination_address: destAddress || undefined,
          from_chain_hint: fromChainKey,
          wallet_address: address || undefined,
        },
        headers,
      )
      setResult(res)
      updateCommand(id, { toChain: res.parsed_intent?.to_chain || '', status: 'pending' })
      if (isMobile) setTimeout(() => setMobileTab('preview'), 300)
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse intent')
      updateCommand(id, { status: 'failed' })
    } finally {
      setLoading(false)
    }
  }, [command, loading, chainsLoading, chains, fromChainIdx, destAddress, address, isMobile, addCommand, updateCommand])

  const handleConfirm = useCallback(async () => {
    if (!result || !address) {
      toast.error('No transaction data')
      return
    }
    await confirmAndSign({
      result,
      address,
      selectedProvider,
      currentTransaction,
      approval,
      destAddress,
      chainId,
      switchChainAsync,
      sendTransactionAsync,
      settleRef,
      txKindRef,
      setTxBuilding,
      setCurrentTransaction,
      setApproval,
      setConfirming,
      setTxHash,
      onFail: () => {
        if (histId) updateCommand(histId, { status: 'failed' })
      },
    })
  }, [
    result,
    address,
    selectedProvider,
    currentTransaction,
    approval,
    destAddress,
    chainId,
    switchChainAsync,
    sendTransactionAsync,
    histId,
    updateCommand,
  ])

  const closeSuccess = useCallback(() => {
    setShowSuccess(false)
    setResult(null)
    setApproval(null)
    setCommand('')
    setDestAddress('')
    setShowDestInput(false)
    setTxHash('')
    settleRef.current = null
  }, [])

  const toggleRecording = useCallback(() => {
    isRecording ? stopRecording() : startRecording()
  }, [isRecording, startRecording, stopRecording])

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') setShowSuccess(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [handleSubmit])

  const displayChains = chains.map(c => c.name)

  // Suggestions written from what is supported right now, so every one of them
  // is a command the platform can actually serve.
  const quickCommands = useMemo(
    () => buildQuickCommands(chains, tokens),
    [chains, tokens],
  )

  // History is the connected wallet's backend transactions, with this session's
  // in-flight (pending) commands overlaid for instant feedback. Nothing shows
  // when no wallet is connected.
  const commandHistory = useMemo(() => {
    if (!isConnected) return []
    const pending = sessionCommands.filter(c => c.status === 'pending')
    const pendingHashes = new Set(pending.map(c => c.txHash).filter(Boolean))
    const backend = walletHistory.filter(w => !w.txHash || !pendingHashes.has(w.txHash))
    return [...pending, ...backend]
  }, [isConnected, sessionCommands, walletHistory])

  const totalVolume = commandHistory
    .filter(c => c.status === 'completed')
    .reduce((s, c) => s + (c.volumeUsd || 0), 0)
  const isConfirming = confirming || isSending || isWaiting || txBuilding
  const explorerChain = chains.find(c => c.chain_id === result?.transaction?.chain_id)
  const explorerUrl = (explorerChain?.explorer || 'https://etherscan.io') + '/tx/'

  return {
    address,
    isConnected,
    chainName,
    balance,
    connect,
    disconnect,
    command,
    setCommand,
    textareaRef,
    isRecording,
    toggleRecording,
    chains,
    displayChains,
    chainsLoading,
    fromChainIdx,
    handleNetworkSwitch,
    destAddress,
    setDestAddress,
    showDestInput,
    setShowDestInput,
    loading,
    result,
    handleSubmit,
    selectedProvider,
    handleSelectProvider,
    ratings,
    feeInfo,
    tokens,
    tokenTotal,
    tokenQuery,
    setTokenQuery,
    handleConfirm,
    approval,
    isConfirming,
    isSending,
    isWaiting,
    showSuccess,
    txHash,
    closeSuccess,
    explorerUrl,
    pendingWarning,
    isMobile,
    mobileTab,
    setMobileTab,
    commandHistory,
    totalVolume,
    quickCommands,
  }
}

export type IntentExecution = ReturnType<typeof useIntentExecution>
