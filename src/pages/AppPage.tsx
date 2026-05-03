// src/pages/AppPage.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import {
  intentService,
  IntentResponse,
  QuoteResponse,
  TransactionPayload,
} from '../services/intentService'
import { useAppStore } from '../store/appStore'
import { useWallet } from '../hooks/useWallet'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { BottomSheet } from '../components/app/BottomSheet'
import { NetworkDropdown } from '../components/app/NetworkDropdown'
import { WalletPanelContent } from '../components/app/WalletPanelContent'
import { TxPreviewContent } from '../components/app/TxPreviewContent'
import { HistoryContent } from '../components/app/HistoryContent'
import { ProviderTable } from '../components/app/ProviderTable'
import { ConfirmButton } from '../components/app/ConfirmButton'
import {
  C,
  monoSm,
  displayFont,
  uppercaseLabel,
  borderBottom,
  Spinner,
  Icon,
  PulseDot,
} from '../components/app/shared'

// ─── Constants ────────────────────────────────────────────────
const QUICK_COMMANDS = [
  'Bridge 1 ETH from Ethereum to Polygon',
  'Swap 100 USDC for WETH on Arbitrum',
  'Send 50 DAI from Base to Optimism',
  'Move all USDT from Optimism to mainnet',
  'Bridge 0.5 ETH from Ethereum to Avalanche',
]

const EXPLORERS: Record<number, string> = {
  1:     'https://etherscan.io/tx/',
  42161: 'https://arbiscan.io/tx/',
  8453:  'https://basescan.org/tx/',
  10:    'https://optimistic.etherscan.io/tx/',
  137:   'https://polygonscan.com/tx/',
  43114: 'https://snowtrace.io/tx/',
  56:    'https://bscscan.com/tx/',
  100:   'https://gnosisscan.io/tx/',
}

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  optimism: 10,
  polygon: 137,
  avalanche: 43114,
  bsc: 56,
  gnosis: 100,
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type MobileTab = 'command' | 'preview' | 'history'

// ─── Main component ───────────────────────────────────────────
export default function AppPage() {
  const { commandHistory, addCommand, updateCommand } = useAppStore()
  const { address, isConnected, chainName, balance, chainId, connect, disconnect, switchChainAsync } =
    useWallet()

  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IntentResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [fromChainIdx, setFromChainIdx] = useState(0)
  const [networkDropdown, setNetworkDropdown] = useState(false)
  const [destAddress, setDestAddress] = useState('')
  const [showDestInput, setShowDestInput] = useState(false)
  const [histId, setHistId] = useState<string | null>(null)
  const [chains, setChains] = useState<string[]>([])
  const [chainsLoading, setChainsLoading] = useState(true)

  // Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<string>('lifi')
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPayload | null>(null)
  const [txBuilding, setTxBuilding] = useState(false)

  // Mobile‑specific state
  const [mobileTab, setMobileTab] = useState<MobileTab>('command')
  const [sheetWallet, setSheetWallet] = useState(false)
  const [sheetHistory, setSheetHistory] = useState(false)
  const [sheetNetwork, setSheetNetwork] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isRecording, transcript, error: voiceError, startRecording, stopRecording } =
    useVoiceInput()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const { data: receipt, isLoading: isWaiting, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fetch chains
  useEffect(() => {
    intentService
      .getChains()
      .then(data => {
        setChains(data)
        setChainsLoading(false)
      })
      .catch(() => {
        setChains([
          'ethereum', 'arbitrum', 'base', 'optimism', 'polygon',
          'avalanche', 'bnb', 'gnosis',
        ])
        setChainsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (voiceError) toast.error(`Voice: ${voiceError}`)
  }, [voiceError])
  useEffect(() => {
    if (transcript) setCommand(transcript)
  }, [transcript])

  useEffect(() => {
    if (txSuccess && receipt && histId) {
      const txData = currentTransaction?.data || ''
      if (txData.startsWith('0x095ea7b3')) {
        toast.success('Approval confirmed. Please sign the next transaction.')
        setConfirming(false)
        return
      }
      setShowSuccess(true)
      updateCommand(histId, { status: 'completed', txHash: receipt.transactionHash })
      toast.success('Transaction settled!')
      setConfirming(false)
    }
  }, [txSuccess, receipt, histId, updateCommand, currentTransaction])

  // Helper to switch network when a chain is selected
  const handleNetworkSwitch = async (idx: number) => {
    const chainNameLower = chains[idx]?.toLowerCase()
    const targetChainId = chainNameLower ? CHAIN_IDS[chainNameLower] : undefined

    if (targetChainId && switchChainAsync && targetChainId !== chainId) {
      try {
        await switchChainAsync({ chainId: targetChainId })
      } catch (err: any) {
        toast.error(err.message || 'Failed to switch network')
      }
    }
    setFromChainIdx(idx)
  }

  // Fetch transaction for a given quote
  const fetchTransactionForQuote = useCallback(
    async (quote: QuoteResponse) => {
      if (!address) return
      setTxBuilding(true)
      try {
        const tx = await intentService.buildTransaction(quote, address)
        setCurrentTransaction(tx)
      } catch (e: any) {
        toast.error(e.message || 'Failed to build transaction')
      } finally {
        setTxBuilding(false)
      }
    },
    [address],
  )

  // Handle provider selection
  const handleSelectProvider = useCallback(
    (providerName: string) => {
      if (!result) return
      const selectedQuote = result.all_quotes.find(q => q.provider === providerName)
      if (!selectedQuote) return

      setSelectedProvider(providerName)
      if (selectedQuote.provider === result.selected_provider) {
        setCurrentTransaction(result.transaction)
      } else {
        fetchTransactionForQuote(selectedQuote)
      }
    },
    [result, fetchTransactionForQuote],
  )

  // On new result, default to lifi (or the first available)
  useEffect(() => {
    if (!result) return
    const defaultQuote =
      result.all_quotes.find(q => q.provider === 'lifi') || result.all_quotes[0]
    if (defaultQuote) {
      handleSelectProvider(defaultQuote.provider)
    }
  }, [result, handleSelectProvider])

  const handleSubmit = useCallback(async () => {
    if (!command.trim() || loading || chainsLoading) return
    setLoading(true)
    setResult(null)
    setCurrentTransaction(null)
    if (isMobile) setMobileTab('command')

    const fromChainDisplay = chains[fromChainIdx] || 'ethereum'
    const id = addCommand({
      command: command.trim(),
      fromChain: capitalize(fromChainDisplay),
      toChain: '',
      status: 'pending',
    })
    setHistId(id)

    try {
      const res = await intentService.execute({
        command: command.trim(),
        destination_address: destAddress || undefined,
        from_chain_hint: fromChainDisplay.toLowerCase(),
        wallet_address: address || undefined,
      })
      setResult(res)
      updateCommand(id, {
        toChain: res.parsed_intent.to_chain || '',
        status: 'pending',
      })
      if (isMobile) setTimeout(() => setMobileTab('preview'), 300)
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse intent')
      updateCommand(id, { status: 'failed' })
    } finally {
      setLoading(false)
    }
  }, [
    command,
    loading,
    chainsLoading,
    chains,
    fromChainIdx,
    destAddress,
    address,
    isMobile,
    addCommand,
    updateCommand,
  ])

  const handleConfirm = async () => {
    const tx = currentTransaction
    if (!result || !address || !tx) {
      toast.error('No transaction data')
      return
    }
    if (!tx.to) {
      toast.error('Invalid transaction data')
      return
    }

    if (chainId !== tx.chain_id) {
      try {
        toast.loading(`Switching network to ${tx.chain_name || 'required chain'}...`, {
          id: 'switch',
        })
        await switchChainAsync({ chainId: tx.chain_id })
        toast.success('Network switched. Press Confirm again.', { id: 'switch' })
      } catch (err: any) {
        toast.error(err.message || 'Failed to switch network', { id: 'switch' })
      }
      return
    }

    setConfirming(true)
    try {
      // Fix: handle both hex (0x…) and decimal value strings
      let value: bigint
      const rawValue = tx.value || '0'
      if (rawValue.startsWith('0x')) {
        value = BigInt(rawValue)
      } else {
        try {
          value = parseEther(rawValue)
        } catch {
          value = parseUnits(rawValue, 18)
        }
      }

      const hash = await sendTransactionAsync({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value,
        gas: tx.gas_limit ? BigInt(tx.gas_limit) : undefined,
      })
      setTxHash(hash)
      toast.loading('Transaction broadcasted. Waiting for confirmation...', { id: 'tx' })
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed')
      setConfirming(false)
      if (histId) updateCommand(histId, { status: 'failed' })
    }
  }

  const closeSuccess = () => {
    setShowSuccess(false)
    setResult(null)
    setCommand('')
    setDestAddress('')
    setShowDestInput(false)
    setTxHash('')
  }

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording()
  }

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') {
        setShowSuccess(false)
        setNetworkDropdown(false)
        setSheetWallet(false)
        setSheetHistory(false)
        setSheetNetwork(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [handleSubmit])

  const displayChains = chains.map(c => capitalize(c))
  const totalVolume = commandHistory
    .filter(c => c.status === 'completed')
    .reduce((s, c) => s + (c.volumeUsd || 0), 0)
  const isConfirming = confirming || isSending || isWaiting || txBuilding
  const explorerUrl = result?.quote?.chain_id
    ? EXPLORERS[result.quote.chain_id]
    : 'https://etherscan.io/tx/'

  const CommandCard = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          opacity: isConnected ? 1 : 0.7,
          transition: 'opacity 0.4s',
        }}
      >
        <PulseDot connected={isConnected} />
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          {isConnected
            ? `Connected (${balance} ${chainName}) — Ready`
            : 'Connect wallet to begin'}
        </span>
      </div>

      <div
        style={{
          background: C.panel,
          border: `1px solid ${loading ? C.muted : result ? C.body : C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          boxShadow: result ? `0 0 0 3px rgba(102,102,102,0.08)` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '1rem 1rem 0' }}>
          <button
            onClick={toggleRecording}
            style={{
              width: 40,
              height: 40,
              border: `1px solid ${isRecording ? C.body : C.border}`,
              borderRadius: 8,
              background: isRecording ? C.mid : C.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              color: isRecording ? C.max : C.muted,
              transition: 'all 0.3s',
            }}
          >
            <Icon.Mic size={16} />
          </button>
          <div style={{ flex: 1, padding: '0 0.75rem' }}>
            <textarea
              ref={textareaRef}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder={
                isMobile ? 'Speak or type a command...' : 'Send 50 USDC from Arbitrum to Base...'
              }
              rows={isMobile ? 3 : 3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: "'DM Mono',monospace",
                fontSize: isMobile ? '0.95rem' : '0.9rem',
                color: C.hi,
                lineHeight: 1.6,
                minHeight: 72,
                caretColor: C.label,
              }}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '0 1rem 0.5rem',
            paddingLeft: 'calc(1rem + 40px + 0.75rem)',
          }}
        >
          <button
            onClick={() => setShowDestInput(!showDestInput)}
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.mid,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono',monospace",
              padding: 0,
            }}
          >
            {showDestInput ? '− Hide' : '+ Custom destination address'}
          </button>
          {showDestInput && (
            <input
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              placeholder="0x... destination address (optional)"
              style={{
                display: 'block',
                width: '100%',
                marginTop: '0.5rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '0.45rem 0.75rem',
                fontFamily: "'DM Mono',monospace",
                fontSize: '0.75rem',
                color: C.body,
                outline: 'none',
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <button
              onClick={() =>
                isMobile ? setSheetNetwork(true) : setNetworkDropdown(!networkDropdown)
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                fontSize: '0.68rem',
                color: C.body,
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: "'DM Mono',monospace",
                whiteSpace: 'nowrap',
              }}
            >
              <Icon.Swap size={10} />
              {isMobile
                ? displayChains[fromChainIdx] || 'Chain'
                : `From: ${displayChains[fromChainIdx] || 'Loading...'}`}
            </button>
            {!isMobile && <span style={{ fontSize: '0.62rem', color: C.mid }}>⌘↵ to send</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!command.trim() || loading || chainsLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: isMobile ? '0.55rem 1.1rem' : '0.5rem 1.25rem',
              background: !command.trim() || loading || chainsLoading ? C.mid : C.max,
              color: !command.trim() || loading || chainsLoading ? C.muted : C.bg,
              border: 'none',
              borderRadius: 6,
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {loading ? (
              <>
                <Spinner size={13} light /> Processing
              </>
            ) : (
              'Execute'
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `1px solid ${C.muted}`,
                borderTopColor: C.hi,
                borderRadius: '50%',
              }}
              className="spinner"
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 6,
                height: 6,
                background: C.body,
                borderRadius: '50%',
              }}
            />
          </div>
          <div style={{ fontSize: '0.78rem', color: C.muted }}>Processing your command...</div>
        </div>
      )}

      {result && !loading && (
        <ProviderTable
          result={result}
          selectedProvider={selectedProvider}
          onSelectProvider={handleSelectProvider}
        />
      )}

      {result && !loading && isMobile && (
        <ConfirmButton
          result={result}
          isConfirming={isConfirming}
          isSending={isSending}
          isWaiting={isWaiting}
          onConfirm={handleConfirm}
        />
      )}

      {!loading && !result && (
        <div>
          <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', display: 'block' }}>
            Quick Commands
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {QUICK_COMMANDS.map((c, i) => (
              <button
                key={i}
                onClick={() => setCommand(c)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 40,
                  fontSize: '0.72rem',
                  color: C.muted,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'DM Mono',monospace",
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = C.surface)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const DesktopNetworkDropdown = !isMobile && networkDropdown ? (
    <div
      onClick={() => setNetworkDropdown(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 198 }}
    />
  ) : null

  return (
    <>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { animation: spin 0.7s linear infinite; }
        @media (max-width: 767px) {
          body { cursor: auto !important; }
          #cursor-dot, #cursor-ring { display: none !important; }
        }
      `}</style>

      {showSuccess && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) closeSuccess()
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: `1.5px solid ${C.muted}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.label,
              }}
            >
              <Icon.Check size={24} />
            </div>
            <div
              style={{
                ...displayFont,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: C.max,
                letterSpacing: '-0.02em',
              }}
            >
              Transaction Settled
            </div>
            <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
              Your assets have been successfully bridged. The destination address will reflect the
              balance after on-chain confirmation.
            </p>
            <div
              style={{
                padding: '0.6rem 0.85rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                fontSize: '0.68rem',
                color: C.muted,
                wordBreak: 'break-all',
                textAlign: 'left',
                width: '100%',
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {txHash.slice(0, 20)}...{txHash.slice(-8)}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                onClick={closeSuccess}
                className="sw-btn sw-btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                New Command
              </button>
              <a
                href={`${explorerUrl}${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sw-btn sw-btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      )}

      {DesktopNetworkDropdown}

      {isMobile ? (
        <div
          style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: C.bg,
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              background: C.panel,
              borderBottom: `1px solid ${C.border}`,
              padding: '0 1rem',
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              zIndex: 100,
            }}
          >
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                ...displayFont,
                fontSize: '0.95rem',
                fontWeight: 800,
                color: C.max,
                letterSpacing: '-0.03em',
                textDecoration: 'none',
              }}
            >
              Swipass
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setSheetWallet(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  border: `1px solid ${C.border}`,
                  borderRadius: 40,
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Mono',monospace",
                  fontSize: '0.68rem',
                  color: isConnected ? C.body : C.muted,
                  transition: 'all 0.2s',
                }}
              >
                <PulseDot connected={isConnected} />
                {isConnected
                  ? `${address?.slice(0, 4)}...${address?.slice(-3)}`
                  : 'Wallet'}
              </button>

              <button
                onClick={() => setSheetNetwork(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.6rem',
                  border: `1px solid ${C.border}`,
                  borderRadius: 40,
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Mono',monospace",
                  fontSize: '0.68rem',
                  color: C.muted,
                }}
              >
                {displayChains[fromChainIdx]?.slice(0, 3) || '...'}
                <Icon.ChevronDown size={9} />
              </button>
            </div>
          </header>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.2,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '1.25rem 1rem',
                paddingBottom: '5rem',
              }}
            >
              {mobileTab === 'command' && CommandCard}

              {mobileTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <TxPreviewContent result={result} displayChains={displayChains} />
                  {result && (
                    <ConfirmButton
                      result={result}
                      isConfirming={isConfirming}
                      isSending={isSending}
                      isWaiting={isWaiting}
                      onConfirm={handleConfirm}
                    />
                  )}
                </div>
              )}

              {mobileTab === 'history' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                      padding: '1rem',
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                    }}
                  >
                    {[
                      { val: `$${totalVolume.toFixed(0)}`, lbl: 'Volume' },
                      {
                        val: commandHistory.filter(c => c.status === 'completed').length,
                        lbl: 'Settled',
                      },
                      { val: commandHistory.length, lbl: 'Total' },
                    ].map(s => (
                      <div
                        key={s.lbl}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.15rem',
                          alignItems: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            ...displayFont,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: C.hi,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {s.val}
                        </div>
                        <div
                          style={{
                            fontSize: '0.58rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: C.muted,
                          }}
                        >
                          {s.lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                  <HistoryContent commandHistory={commandHistory} />
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: C.panel,
              borderTop: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'stretch',
              zIndex: 200,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {([
              { id: 'command' as const, label: 'Command', Icon: Icon.Command },
              {
                id: 'preview' as const,
                label: 'Preview',
                Icon: Icon.Eye,
                badge: result ? '!' : null,
              },
              {
                id: 'history' as const,
                label: 'History',
                Icon: Icon.Clock,
                badge: commandHistory.length > 0 ? commandHistory.length : null,
              },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0.6rem 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: mobileTab === tab.id ? C.max : C.muted,
                  borderTop: `2px solid ${mobileTab === tab.id ? C.max : 'transparent'}`,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <tab.Icon size={18} />
                <span
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {tab.label}
                </span>
                {tab.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 'calc(50% - 16px)',
                      background: C.mid,
                      color: C.max,
                      borderRadius: 10,
                      fontSize: '0.5rem',
                      padding: '0.05rem 0.35rem',
                      minWidth: 14,
                      textAlign: 'center',
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {tab.badge}
                  </div>
                )}
              </button>
            ))}
          </div>

          <BottomSheet
            open={sheetWallet}
            onClose={() => setSheetWallet(false)}
            title="Wallet"
            maxHeight="70vh"
          >
            <WalletPanelContent
              isConnected={isConnected}
              address={address}
              balance={balance}
              chainName={chainName}
              connect={connect}
              disconnect={disconnect}
            />
          </BottomSheet>

          <BottomSheet
            open={sheetNetwork}
            onClose={() => setSheetNetwork(false)}
            title="Select Network"
            maxHeight="75vh"
          >
            {displayChains.map((chain, idx) => (
              <button
                key={chain}
                onClick={async () => {
                  await handleNetworkSwitch(idx)
                  setSheetNetwork(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.9rem 0',
                  width: '100%',
                  border: 'none',
                  borderBottom: `1px solid ${C.border}`,
                  background: 'none',
                  color: fromChainIdx === idx ? C.max : C.body,
                  fontFamily: "'DM Mono',monospace",
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <PulseDot connected={fromChainIdx === idx} size={7} />
                {chain}
                {fromChainIdx === idx && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      color: C.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Selected
                  </span>
                )}
              </button>
            ))}
          </BottomSheet>

          <BottomSheet
            open={sheetHistory}
            onClose={() => setSheetHistory(false)}
            title={`History (${commandHistory.length})`}
            maxHeight="85vh"
          >
            <HistoryContent commandHistory={commandHistory} />
          </BottomSheet>
        </div>
      ) : (
        <div
          style={{
            height: '100vh',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: '56px 1fr',
            gridTemplateColumns: '260px 1fr 320px',
            background: C.bg,
            fontFamily: "'DM Mono',monospace",
          }}
          onClick={() => setNetworkDropdown(false)}
        >
          <header
            style={{
              gridColumn: '1/-1',
              gridRow: 1,
              background: C.panel,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1.25rem',
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  ...displayFont,
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: C.max,
                  letterSpacing: '-0.03em',
                  textDecoration: 'none',
                }}
              >
                Swipass
              </Link>
              <nav
                style={{
                  display: 'flex',
                  gap: 0,
                  borderLeft: `1px solid ${C.border}`,
                  paddingLeft: '1.5rem',
                }}
              >
                {[
                  ['App', '/app'],
                  ['Dashboard', '/dashboard'],
                  ['Docs', '/docs'],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    to={href}
                    style={{
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: href === '/app' ? C.max : C.muted,
                      padding: '0.3rem 0.75rem',
                      borderRadius: 3,
                      background: href === '/app' ? C.surface2 : 'transparent',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setNetworkDropdown(!networkDropdown)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.3rem 0.75rem',
                    border: `1px solid ${C.border}`,
                    borderRadius: 40,
                    fontSize: '0.7rem',
                    color: C.body,
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  <PulseDot connected={isConnected} />
                  {isConnected ? chainName : 'Select Network'}
                  <Icon.ChevronDown size={10} />
                </button>
                {networkDropdown && !chainsLoading && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      minWidth: 180,
                      zIndex: 200,
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    {displayChains.map((chain, idx) => (
                      <button
                        key={chain}
                        onClick={() => {
                          handleNetworkSwitch(idx)
                          setNetworkDropdown(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.72rem',
                          color: fromChainIdx === idx ? C.max : C.body,
                          background: fromChainIdx === idx ? C.surface : 'none',
                          width: '100%',
                          border: 'none',
                          borderBottom: `1px solid ${C.border}`,
                          cursor: 'pointer',
                          fontFamily: "'DM Mono',monospace",
                          transition: 'background 0.2s',
                        }}
                      >
                        <PulseDot connected={fromChainIdx === idx} />
                        {chain}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={isConnected ? disconnect : connect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  background: isConnected ? C.surface : C.max,
                  color: isConnected ? C.label : C.bg,
                  border: isConnected ? `1px solid ${C.border}` : 'none',
                  borderRadius: 4,
                  fontFamily: "'DM Mono',monospace",
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {isConnected
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : 'Connect Wallet'}
              </button>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: C.muted,
                  padding: '0.4rem 0.75rem',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
              >
                <Icon.Grid size={11} />
                Dashboard
              </Link>
            </div>
          </header>

          <aside
            style={{
              gridColumn: 1,
              gridRow: 2,
              borderRight: `1px solid ${C.border}`,
              background: C.panel,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1rem 1.25rem 0.75rem',
                ...borderBottom,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  ...uppercaseLabel,
                  fontSize: '0.65rem',
                  letterSpacing: '0.14em',
                }}
              >
                Command History
              </span>
              <span
                style={{
                  background: C.surface2,
                  color: C.body,
                  fontSize: '0.6rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 10,
                }}
              >
                {commandHistory.length}
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              <HistoryContent commandHistory={commandHistory} />
            </div>
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[
                  { val: `$${totalVolume.toFixed(0)}`, lbl: 'Volume' },
                  {
                    val: commandHistory.filter(c => c.status === 'completed').length,
                    lbl: 'Settled',
                  },
                  { val: commandHistory.length, lbl: 'Total' },
                ].map(s => (
                  <div
                    key={s.lbl}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                    }}
                  >
                    <div
                      style={{
                        ...displayFont,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: C.hi,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.muted,
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main
            style={{
              gridColumn: 2,
              gridRow: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => setNetworkDropdown(false)}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 500,
                height: 500,
                background:
                  'radial-gradient(ellipse, rgba(100,100,100,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'ambientPulse 6s ease-in-out infinite',
              }}
            />
            <style>{`@keyframes ambientPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
                opacity: 0.25,
                pointerEvents: 'none',
              }}
            />

            <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1 }}>
              {CommandCard}
            </div>
          </main>

          <aside
            style={{
              gridColumn: 3,
              gridRow: 2,
              borderLeft: `1px solid ${C.border}`,
              background: C.panel,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ flexShrink: 0, ...borderBottom }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    ...uppercaseLabel,
                    fontSize: '0.62rem',
                    letterSpacing: '0.14em',
                  }}
                >
                  Wallet
                </span>
              </div>
              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <WalletPanelContent
                  isConnected={isConnected}
                  address={address}
                  balance={balance}
                  chainName={chainName}
                  connect={connect}
                  disconnect={disconnect}
                />
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  ...borderBottom,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    ...uppercaseLabel,
                    fontSize: '0.62rem',
                    letterSpacing: '0.14em',
                  }}
                >
                  Transaction Preview
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
                <TxPreviewContent result={result} displayChains={displayChains} />
              </div>
              {result && (
                <div style={{ padding: '0 1.25rem 1.25rem', flexShrink: 0 }}>
                  <ConfirmButton
                    result={result}
                    isConfirming={isConfirming}
                    isSending={isSending}
                    isWaiting={isWaiting}
                    onConfirm={handleConfirm}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}