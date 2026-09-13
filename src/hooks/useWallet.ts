// src/hooks/useWallet.ts
import { useEffect, useCallback } from 'react'
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

export function useWallet() {
  const { address, isConnected, chainId, chain } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { switchChainAsync } = useSwitchChain()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

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

    // wagmi's WalletConnect connector only starts a fresh pairing (the thing
    // that triggers "open in app") when its underlying provider has no
    // session yet. An attempt that gets interrupted before the wallet app
    // approves it -- e.g. the phone had nothing installed to hand the link
    // off to, or the user backgrounded the tab -- can still leave a session
    // object in place, so every retry after that silently tries to reuse a
    // pairing that was never actually approved instead of prompting again.
    // Disconnecting first clears that out; it is a no-op when there was
    // nothing to clear.
    await Promise.all(
      connectors
        .filter(c => c.type === 'walletConnect')
        .map(c => disconnectAsync({ connector: c }).catch(() => {}))
    )

    if (openConnectModal) {
      openConnectModal()
    } else {
      toast.error('Wallet connection is still loading, try again in a moment')
    }
  }, [connectors, connectAsync, disconnectAsync, openConnectModal])

  const disconnectWallet = useCallback(async () => {
    await disconnectAsync().catch(() => {})
  }, [disconnectAsync])

  return {
    address,
    isConnected,
    chainId,
    balance: balanceData?.formatted || '0',
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Ethereum',
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchChainAsync,
  }
}