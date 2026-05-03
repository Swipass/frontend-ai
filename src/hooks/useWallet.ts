// src/hooks/useWallet.ts
import { useEffect, useCallback } from 'react'
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useConnect,
  useDisconnect,
} from 'wagmi'
import { isMobile } from 'react-device-detect'
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
    const injected = connectors.find(c => c.id === 'injected')
    const wc = connectors.find(c => c.id === 'walletConnect')

    // Mobile: WalletConnect only (injected doesn't exist)
    if (isMobile) {
      if (wc) {
        await connectAsync({ connector: wc }).catch((e: any) =>
          toast.error(e?.message || 'Connection failed')
        )
      } else {
        toast.error('No WalletConnect connector found')
      }
      return
    }

    // Desktop: try injected first, else WalletConnect
    if (injected) {
      try {
        await connectAsync({ connector: injected })
        return // success
      } catch (e: any) {
        // user rejected or not available – fall back to WalletConnect
        if (wc) {
          await connectAsync({ connector: wc }).catch((err: any) =>
            toast.error(err?.message || 'Connection failed')
          )
        } else {
          toast.error('No wallet connector available')
        }
      }
    } else if (wc) {
      await connectAsync({ connector: wc }).catch((err: any) =>
        toast.error(err?.message || 'Connection failed')
      )
    } else {
      toast.error('No wallet connector available')
    }
  }, [connectors, connectAsync])

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