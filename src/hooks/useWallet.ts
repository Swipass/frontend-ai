// src/hooks/useWallet.ts
import { useEffect, useCallback, useRef, useState } from 'react'
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useConnect,
  useDisconnect,
} from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'

const chainNameMap: Record<number, string> = {
  1: 'Ethereum', 42161: 'Arbitrum', 8453: 'Base', 10: 'Optimism',
  137: 'Polygon', 43114: 'Avalanche', 56: 'BNB Chain', 100: 'Gnosis',
}

function logWallet(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[WALLET] ${message}`)
}

// Bounds how long we wait for a WalletConnect-backed connector (the only
// path mobile ever takes, since there is no injected provider there) to
// settle. Nothing upstream -- not wagmi, not RainbowKit's own modal --
// enforces a ceiling on that promise: if the relay/project the connector
// talks to never responds, `connect()` simply never resolves or rejects,
// and the UI sits in "connecting" forever with no error surfaced. This is
// a recovery net, not the fix for why the promise stalls in the first
// place -- see the connector-selection comments below for that.
const CONNECT_TIMEOUT_MS = 45_000

function isMobileEnvironment() {
  return typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// RainbowKit's own connect modal has no public API to close it -- the
// "connecting to X..." screen is entirely internal state, not derived from
// wagmi's connect status, so resetting our own state does nothing to it.
// It does listen globally for Escape and close itself on it (that's how it
// implements the documented close-on-Escape behaviour), which is the only
// externally reachable way to dismiss it. Without this, a timed-out
// connection leaves the user staring at RainbowKit's own stuck spinner
// forever, with our recovery UI rendered uselessly behind it.
function dismissRainbowKitModal() {
  if (typeof document === 'undefined') return
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

export function useWallet() {
  const { address, isConnected, chainId, chain, connector: activeConnector } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { switchChainAsync } = useSwitchChain()
  const { connectAsync, connectors, status: connectStatus, error: connectError, reset: resetConnect } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

  const [connectionError, setConnectionError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearWatchdog = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Bounded connection lifecycle: idle -> connecting -> connected | failed.
  // wagmi's connect mutation status is shared across every `useConnect()`
  // instance on the same config (RainbowKit's own modal calls `connectAsync`
  // internally, not this hook), so watching it here observes the real
  // outcome of a wallet tapped inside RainbowKit's picker, not just our own
  // direct calls.
  useEffect(() => {
    if (connectStatus === 'pending') {
      logWallet('connection request dispatched')
      clearWatchdog()
      timeoutRef.current = setTimeout(() => {
        logWallet('connection error: timed out waiting for wallet response')
        setConnectionError('Connection taking longer than expected')
        // Tear down whatever the stalled attempt left behind so the next
        // wallet the user picks -- same one or a different one -- starts
        // clean instead of inheriting a half-open connector.
        disconnectAsync().catch(() => {})
        resetConnect()
        // And actually get the stuck "connecting..." screen off the user's
        // screen -- see dismissRainbowKitModal for why this is necessary.
        dismissRainbowKitModal()
      }, CONNECT_TIMEOUT_MS)
      return
    }

    clearWatchdog()

    if (connectStatus === 'success') {
      logWallet(`connection resolved${activeConnector ? ` (connector: ${activeConnector.id})` : ''}`)
      setConnectionError(null)
    } else if (connectStatus === 'error') {
      const isRejection =
        connectError?.name === 'UserRejectedRequestError' ||
        /reject|denied|cancel/i.test(connectError?.message || '')
      if (isRejection) {
        logWallet('connection rejected')
        setConnectionError(null) // user cancelling is not a failure state to surface
      } else {
        const safeMessage = connectError?.message?.slice(0, 200) || 'unknown error'
        logWallet(`connection error: ${safeMessage}`)
        setConnectionError('Connection failed')
      }
    }
  }, [connectStatus, connectError, activeConnector, clearWatchdog, disconnectAsync, resetConnect])

  useEffect(() => clearWatchdog, [clearWatchdog])

  // Keep store in sync
  useEffect(() => {
    if (isConnected && address) {
      const chName = chain?.name || chainNameMap[chainId || 1] || 'Ethereum'
      storeConnect(address, chainId || 1, chName)
      if (balanceData?.formatted) setBalance(balanceData.formatted)
      if (chainId) setChain(chainId, chName)
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, chain, balanceData])

  // 🔥 The magic: one connect function that works everywhere
  const connectWallet = useCallback(async () => {
    // A fresh attempt should never carry a stale "taking longer than
    // expected" banner from a previous failed one, and shouldn't be blocked
    // by the watchdog left running for a wallet the user is no longer
    // waiting on.
    setConnectionError(null)
    clearWatchdog()
    logWallet('connection requested')
    logWallet(`mobile environment ${isMobileEnvironment() ? 'detected' : 'not detected'}`)

    // With no WalletConnect project id, buildConfig falls back to a bare
    // injected() connector (type "injected"). With one configured, it uses
    // RainbowKit's default wallet list instead, where MetaMask gets its own
    // dedicated connector (type "metaMask", never "injected"). Matching both
    // types means the browser extension is found either way; matching by
    // type rather than id also survives RainbowKit renaming or reordering
    // its wallet list.
    //
    // That "metaMask" connector exists in the list unconditionally on mobile,
    // extension or not: RainbowKit's own wallet definition treats every mobile
    // browser as "should use the MetaMask connector" regardless of whether
    // MetaMask is actually installed, since on a phone it otherwise falls
    // back to deep-linking rather than a real injected provider. Matching it
    // by type alone made this fast path fire on every phone and try to open
    // MetaMask specifically, which fails outright for anyone using a
    // different wallet app. window.ethereum only ever exists when a real
    // extension (desktop) or wallet-app in-app browser (mobile) injected it,
    // so gate the fast path on that rather than on the connector list alone.
    const hasInjectedProvider = typeof window !== 'undefined' && Boolean((window as any).ethereum)
    const injected = hasInjectedProvider
      ? connectors.find(c => c.type === 'injected' || c.type === 'metaMask')
      : undefined

    // A browser extension wallet is the fast path: one direct call, no modal.
    // Everything else (mobile, or desktop with no extension installed) goes
    // through RainbowKit's own connect modal instead of grabbing a raw
    // WalletConnect connector and calling it directly. RainbowKit deliberately
    // ships that connector with showQrModal disabled so its own modal can
    // drive the WalletConnect UI (QR on desktop, app deep link on mobile) off
    // the connector's display_uri event; calling connect on it ourselves just
    // opens a WalletConnect session and waits for a peer to scan a URI that
    // was never shown to anyone, which looks exactly like nothing happening.
    if (injected) {
      try {
        await connectAsync({ connector: injected })
        return // success
      } catch {
        // user rejected or extension not actually available: offer the modal
      }
    }

    // A previous fix tried to clear a stale WalletConnect session here by
    // calling connector.disconnect() before every connect attempt. That
    // connector's getProvider() lazily calls EthereumProvider.init() once and
    // caches the result for the rest of the page's life -- disconnect() never
    // resets that cache, so tearing down the relay transport left every
    // future connect attempt (including the one RainbowKit's own modal makes
    // right after the user picks a wallet) reusing a dead, already-torn-down
    // transport with nothing left to respond. That is a worse failure than
    // the one it was fixing: an unconditional, unrecoverable hang on every
    // single attempt instead of an occasional stuck retry after an
    // interrupted first one. Removed; see the commit message for the full
    // trace instead of re-adding a variant of this without live testing.
    if (openConnectModal) {
      openConnectModal()
    } else {
      toast.error('Wallet connection is still loading, try again in a moment')
    }
  }, [connectors, connectAsync, openConnectModal, clearWatchdog])

  const disconnectWallet = useCallback(async () => {
    clearWatchdog()
    setConnectionError(null)
    resetConnect()
    await disconnectAsync().catch(() => {})
  }, [disconnectAsync, clearWatchdog, resetConnect])

  return {
    address,
    isConnected,
    chainId,
    balance: balanceData?.formatted || '0',
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Ethereum',
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchChainAsync,
    isConnecting: connectStatus === 'pending',
    connectionError,
  }
}