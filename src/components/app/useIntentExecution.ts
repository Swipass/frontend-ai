// src/components/app/useIntentExecution.ts
// Owns the full transaction state machine for the app command center:
//   submit -> quotes -> select provider -> confirm -> sign -> settle -> report.
// AppPage and the layout components are thin consumers of this hook.
import { useState, useRef, useReducer, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useSendTransaction, usePublicClient } from 'wagmi'
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
import {
  resolveTransactionForConfirm,
  signApproval,
  signSwap,
  SettleSnapshot,
} from './confirmAndSign'
import { measureSettlement, varianceBps, type SettlementReceipt } from './settlement'
import { useReceiptWatcher } from './receiptWatcher'
import {
  txReducer,
  IDLE_ATTEMPT,
  canRequestSignature,
  loadAttempt,
  saveAttempt,
  clearSavedAttempt,
  type TxAttempt,
} from './txStateMachine'

function logTx(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[TX] ${message}`)
}

export function useIntentExecution() {
  const { commandHistory: sessionCommands, addCommand, updateCommand } = useAppStore()
  const [walletHistory, setWalletHistory] = useState<any[]>([])
  const {
    address,
    isConnected,
    chainName,
    balance,
    chainId,
    connect,
    disconnect,
    switchChainAsync,
    isConnecting,
    connectionError,
  } = useWallet()

  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IntentResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
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
  // Pre-flight simulation for whichever quote is currently staged to sign.
  // Tracked separately because it comes from two different endpoints
  // depending on whether the selected quote is the original best one.
  const [simulation, setSimulation] = useState<{ passed: boolean; reason?: string }>({ passed: false })
  const [settlementReceipt, setSettlementReceipt] = useState<SettlementReceipt | null>(null)
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
  // The wallet and destination the current quotes were built for. Their
  // calldata pays those addresses, so it is only signed while both still match.
  const quotedForRef = useRef<{ wallet: string; dest: string } | null>(null)
  // Synchronous re-entrancy guards: refs (not state) because they must block a
  // second call within the same tick/duplicate effect invocation, before React
  // has had a chance to re-render with the reducer's own updated stage.
  const confirmInFlightRef = useRef(false)
  const autoContinueForHashRef = useRef<string | null>(null)
  const checkedReceiptForHashRef = useRef<string | null>(null)

  // The transaction execution state machine: exactly which of the (up to two)
  // signatures is in flight and how far it got. See txStateMachine.ts.
  const [txState, dispatchTx] = useReducer(txReducer, undefined, () => loadAttempt() || IDLE_ATTEMPT)
  // A live mirror of txState, updated synchronously by running the same pure
  // reducer eagerly (not by waiting for a render to commit and an effect to
  // mirror it -- that lags behind a chained .then(), which runs on a
  // microtask that can resolve before React's own commit/effect flush,
  // and would see the pre-dispatch stage). Every dispatch in this file goes
  // through dispatchTxLive below so this ref and the real reducer state can
  // never disagree about what was actually requested.
  const txStateRef = useRef(txState)
  const dispatchTxLive = useCallback((action: Parameters<typeof txReducer>[1]) => {
    txStateRef.current = txReducer(txStateRef.current, action)
    dispatchTx(action)
  }, [])

  const { isRecording, transcript, error: voiceError, startRecording, stopRecording } =
    useVoiceInput()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const publicClient = usePublicClient()
  const receipt = useReceiptWatcher(txState.hash ?? undefined, publicClient)

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
    if ((txState.stage === 'approval_confirming' || txState.stage === 'swap_confirming') && txState.hash) {
      setPendingWarning(false)
      const timer = setTimeout(() => setPendingWarning(true), 30_000)
      return () => clearTimeout(timer)
    }
    setPendingWarning(false)
  }, [txState.stage, txState.hash])

  // Persist the in-flight attempt (stage/kind/hash only, never the transaction
  // payloads) so a refresh or remount recognizes a pending signature instead of
  // silently forgetting it and risking a duplicate send. See txStateMachine.ts.
  useEffect(() => {
    saveAttempt(txState)
  }, [txState])

  // Build the signable transaction (and any approval) for a quote.
  const buildForQuote = useCallback(
    async (quote: QuoteResponse) => {
      if (!address) return
      // A destination named in the command itself arrives on the result.
      const dest = destAddress || result?.destination_address || undefined
      const built = await intentService.buildTransaction(quote, address, dest)
      setCurrentTransaction(built.transaction)
      setApproval(built.approval || null)
      setSimulation({ passed: built.simulation_passed, reason: built.simulation_reason })
      return built
    },
    [address, destAddress, result],
  )

  // --- Receipt watching: bounded, recoverable ---------------------------------

  const checkReceiptNow = useCallback(async () => {
    if (!txState.hash) return
    const r = await receipt.checkNow()
    if (!r) return
    if (r.status === 'success') {
      logTx(`${txState.kind} confirmed: ${r.transactionHash}`)
      dispatchTxLive({ type: 'CONFIRMED', hash: r.transactionHash })
    } else {
      dispatchTxLive({ type: 'REVERTED', hash: r.transactionHash })
    }
  }, [txState.hash, txState.kind, receipt])

  // The hook resolving (mined, either outcome) advances the stage.
  useEffect(() => {
    if (!receipt.isSuccess || !receipt.receipt) return
    const r = receipt.receipt
    if (r.status === 'success') {
      logTx(`${txState.kind} confirmed: ${r.transactionHash}`)
      dispatchTxLive({ type: 'CONFIRMED', hash: r.transactionHash })
    } else {
      dispatchTxLive({ type: 'REVERTED', hash: r.transactionHash })
    }
  }, [receipt.isSuccess, receipt.receipt, txState.kind])

  // The poll exceeded its soft timeout: stop waiting passively, offer a
  // recoverable state instead of leaving the UI on "Processing..." forever.
  useEffect(() => {
    if (receipt.timedOut) dispatchTxLive({ type: 'RECEIPT_TIMEOUT' })
  }, [receipt.timedOut])

  // Entering receipt_check_required (via timeout, or restored after a
  // refresh) gets one automatic direct check; the UI also offers a manual
  // "Check status" button wired to checkReceiptNow for any check after that.
  useEffect(() => {
    if (txState.stage !== 'receipt_check_required' || !txState.hash) return
    if (checkedReceiptForHashRef.current === txState.hash) return
    checkedReceiptForHashRef.current = txState.hash
    checkReceiptNow()
  }, [txState.stage, txState.hash, checkReceiptNow])

  // --- Approval confirmed: rebuild, then continue to the swap automatically ---
  // Not a settlement: an approval only unlocks the swap. The allowance just
  // changed (and some tokens need a reset step first), so the transaction is
  // rebuilt fresh rather than reusing anything quoted before the approval.
  useEffect(() => {
    if (txState.stage !== 'approval_confirmed' || !txState.hash || !result) return
    if (autoContinueForHashRef.current === txState.hash) return
    autoContinueForHashRef.current = txState.hash

    dispatchTxLive({ type: 'REBUILDING' })
    logTx('rebuilding swap')

    const selectedQuote = result.all_quotes.find(q => q.provider === selectedProvider) || result.quote

    buildForQuote(selectedQuote)
      .then(built => {
        if (!built) throw new Error('Failed to rebuild transaction')
        if (built.requires_approval) {
          // A token that needed a reset-to-zero first: the rebuild produced
          // another approval, not the swap yet. Hand back to the explicit
          // approval action instead of trying to sign a swap that would revert.
          toast.success('Allowance reset. Confirm again to approve the amount.', { id: 'tx' })
          dispatchTxLive({ type: 'SIGNATURE_REJECTED', message: '' })
          return
        }
        logTx('swap transaction ready')
        if (!canRequestSignature(txStateRef.current, 'swap')) return
        dispatchTxLive({
          type: 'REQUEST_SIGNATURE',
          kind: 'swap',
          provider: selectedQuote.provider,
          quoteId: selectedQuote.quote_id,
        })
        logTx('swap signature requested')
        toast.loading('Confirm the swap in your wallet...', { id: 'tx' })
        return signSwap({
          tx: built.transaction,
          result,
          selectedQuote,
          address: address!,
          destAddress,
          publicClient,
          simulation: { passed: built.simulation_passed, reason: built.simulation_reason },
          sendTransactionAsync,
          settleRef,
        }).then(hash => {
          logTx(`swap submitted: ${hash}`)
          dispatchTxLive({ type: 'SUBMITTED', hash })
          dispatchTxLive({ type: 'CONFIRMING' })
          logTx('swap confirmation started')
          toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'tx' })
        })
      })
      .catch((e: any) => {
        // Either the rebuild failed, or the wallet did not produce a
        // signature automatically (many wallets require a fresh user
        // gesture for a second prompt, especially on mobile). Do not fake
        // automation: hand the user back an explicit, enabled action instead
        // of a silent failure or an indefinite spinner.
        toast.error(e?.message || 'Approved. Confirm swap to continue.', { id: 'tx' })
        dispatchTxLive({ type: 'SIGNATURE_REJECTED', message: e?.message || 'Confirm swap to continue' })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txState.stage, txState.hash, result, selectedProvider])

  // --- Swap confirmed: settle, measure truth-return, report ------------------
  useEffect(() => {
    if (txState.stage !== 'swap_confirmed' || !txState.hash || !histId) return
    const snap = settleRef.current
    const hash = txState.hash

    updateCommand(histId, { status: 'completed', txHash: hash, volumeUsd: snap?.volumeUsd })
    setShowSuccess(true)
    toast.success('Transaction settled!')
    clearSavedAttempt()

    if (snap) {
      dispatchTxLive({ type: 'REPORTING' })
      logTx('reporting settlement')
      // The receipt: quoted vs. executed, in the open, every time. Shown
      // immediately with what we already know; "actual" and "settlement"
      // fill in once measurement resolves (or stay unmeasured, honestly,
      // rather than echo the quote back as its own proof). See
      // docs/security-model.md.
      setSettlementReceipt({
        quotedToAmount: snap.toAmount,
        toToken: snap.toToken,
        provider: snap.provider,
        simulationPassed: snap.simulationPassed,
        simulationReason: snap.simulationReason,
        // A same-chain swap can be measured from this very receipt; a
        // bridge's destination leg cannot, and stays pending here (the
        // source-chain transaction above did confirm).
        settlement: 'pending',
      })
      const logs = receipt.receipt?.logs || []
      measureSettlement(snap, logs, publicClient)
        .then(actual => {
          intentService
            .reportStatus(snap.intentId, hash, 'completed', actual)
            .then(() => logTx('settlement reported'))
            .catch(() => {})
          if (actual) {
            setSettlementReceipt(prev =>
              prev
                ? { ...prev, actualToAmount: actual, varianceBps: varianceBps(snap.toAmount, actual) ?? undefined, settlement: 'confirmed' }
                : prev,
            )
          }
          dispatchTxLive({ type: 'REPORTED' })
        })
        .catch(() => dispatchTxLive({ type: 'REPORTED' }))
    } else {
      dispatchTxLive({ type: 'REPORTED' })
    }
    fetchWalletHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txState.stage, txState.hash, histId])

  // --- A transaction reverted on-chain ----------------------------------------
  useEffect(() => {
    if (txState.stage !== 'failed' || !txState.hash) return
    if (histId) updateCommand(histId, { status: 'failed' })
    const snap = settleRef.current
    if (snap) intentService.reportStatus(snap.intentId, txState.hash, 'failed').catch(() => {})
    toast.error(txState.error || 'Transaction reverted on-chain')
    clearSavedAttempt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txState.stage, txState.hash])

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
        setSimulation({ passed: result.simulation_passed, reason: result.simulation_reason })
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
    dispatchTxLive({ type: 'RESET' })
    clearSavedAttempt()
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

    quotedForRef.current = { wallet: (address || '').toLowerCase(), dest: (destAddress || '').toLowerCase() }
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
    // Quotes made before a wallet connected, or for another wallet or
    // destination, carry calldata that pays whoever they were built for. Never
    // sign those: fetch fresh quotes for the wallet and destination now in use.
    const quotedFor = quotedForRef.current
    if (
      !quotedFor ||
      quotedFor.wallet !== address.toLowerCase() ||
      quotedFor.dest !== (destAddress || '').toLowerCase()
    ) {
      toast('Your wallet or destination changed since these quotes. Getting fresh quotes...', { id: 'requote' })
      await handleSubmit()
      return
    }

    // Synchronous re-entrancy guard: blocks a second call from slipping
    // through (a fast double-click, or a duplicate handler invocation)
    // before the reducer's own dispatch has been applied on re-render.
    if (confirmInFlightRef.current) return
    confirmInFlightRef.current = true
    try {
      const resolved = await resolveTransactionForConfirm({
        result,
        selectedProvider,
        currentTransaction,
        approval,
        address,
        destAddress,
        chainId,
        switchChainAsync,
        setTxBuilding,
        setCurrentTransaction,
        setApproval,
        onToast: (message, kind) => {
          if (kind === 'error') toast.error(message, { id: 'tx' })
          else if (kind === 'loading') toast.loading(message, { id: 'switch' })
          else toast.success(message, { id: 'switch' })
        },
      })
      if (!resolved) return
      const { tx, approval: neededApproval } = resolved
      const selectedQuote = result.all_quotes.find(q => q.provider === selectedProvider) || result.quote

      if (neededApproval) {
        if (!canRequestSignature(txStateRef.current, 'approval')) return
        dispatchTxLive({
          type: 'REQUEST_SIGNATURE',
          kind: 'approval',
          provider: selectedQuote.provider,
          quoteId: selectedQuote.quote_id,
        })
        logTx('approval signature requested')
        try {
          const hash = await signApproval({ approval: neededApproval, sendTransactionAsync })
          logTx(`approval submitted: ${hash}`)
          dispatchTxLive({ type: 'SUBMITTED', hash })
          dispatchTxLive({ type: 'CONFIRMING' })
          logTx('approval confirmation started')
          const label = neededApproval.is_reset
            ? `Resetting the ${neededApproval.token_symbol} allowance...`
            : `Approving ${neededApproval.token_symbol}...`
          toast.loading(label, { id: 'tx' })
        } catch (err: any) {
          toast.error(err.message || 'Approval rejected', { id: 'tx' })
          dispatchTxLive({ type: 'SIGNATURE_REJECTED', message: err.message || 'Approval rejected' })
        }
        return
      }

      if (!canRequestSignature(txStateRef.current, 'swap')) return
      dispatchTxLive({
        type: 'REQUEST_SIGNATURE',
        kind: 'swap',
        provider: selectedQuote.provider,
        quoteId: selectedQuote.quote_id,
      })
      logTx('swap signature requested')
      try {
        const hash = await signSwap({
          tx,
          result,
          selectedQuote,
          address,
          destAddress,
          publicClient,
          simulation,
          sendTransactionAsync,
          settleRef,
        })
        logTx(`swap submitted: ${hash}`)
        dispatchTxLive({ type: 'SUBMITTED', hash })
        dispatchTxLive({ type: 'CONFIRMING' })
        logTx('swap confirmation started')
        toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'tx' })
      } catch (err: any) {
        toast.error(err.message || 'Transaction failed', { id: 'tx' })
        dispatchTxLive({ type: 'SIGNATURE_REJECTED', message: err.message || 'Transaction failed' })
        if (histId) updateCommand(histId, { status: 'failed' })
      }
    } finally {
      confirmInFlightRef.current = false
    }
  }, [
    result,
    address,
    selectedProvider,
    currentTransaction,
    approval,
    destAddress,
    chainId,
    publicClient,
    simulation,
    switchChainAsync,
    sendTransactionAsync,
    histId,
    updateCommand,
    handleSubmit,
  ])

  const closeSuccess = useCallback(() => {
    setShowSuccess(false)
    setResult(null)
    setApproval(null)
    setCommand('')
    setDestAddress('')
    setShowDestInput(false)
    setSettlementReceipt(null)
    settleRef.current = null
    dispatchTxLive({ type: 'RESET' })
    clearSavedAttempt()
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
  const isSendingNow = isSending && (txState.stage === 'awaiting_approval_signature' || txState.stage === 'awaiting_swap_signature')
  const isWaiting = txState.stage === 'approval_confirming' || txState.stage === 'swap_confirming'
  const isConfirming =
    isSendingNow ||
    isWaiting ||
    txBuilding ||
    txState.stage === 'rebuilding_swap' ||
    txState.stage === 'reporting'
  const explorerChain = chains.find(c => c.chain_id === result?.transaction?.chain_id)
  const explorerUrl = (explorerChain?.explorer || 'https://etherscan.io') + '/tx/'

  return {
    address,
    isConnected,
    chainName,
    balance,
    connect,
    disconnect,
    isConnecting,
    connectionError,
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
    txState,
    checkReceiptNow,
    isConfirming,
    isSending: isSendingNow,
    isWaiting,
    showSuccess,
    txHash: txState.hash || '',
    settlementReceipt,
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
