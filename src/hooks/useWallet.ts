// src/hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useEffect } from 'react'
import { useWalletStore } from '../store/walletStore'

const chainNameMap: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  8453: 'Base',
  10: 'Optimism',
  137: 'Polygon',
  43114: 'Avalanche',
  56: 'BNB Chain',
  100: 'Gnosis',
}

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

  useEffect(() => {
    if (isConnected && address) {
      storeConnect(address, chainId || 1, chainNameMap[chainId || 1] || 'Unknown')
      if (balanceData) setBalance(balanceData.formatted)
      if (chainId) {
        setChain(chainId, chainNameMap[chainId] || 'Unknown')
      }
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, balanceData, storeConnect, storeDisconnect, setBalance, setChain])

  const connectWallet = () => {
    // Calling connect() without arguments opens the wallet selection modal
    // when multiple connectors are registered (injected + walletConnect).
    connect()
  }

  return {
    address,
    isConnected,
    chainId,
    balance: balanceData?.formatted || '0',
    connect: connectWallet,
    disconnect,
    switchChain,
    isConnecting,
  }
}