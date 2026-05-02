// src/hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
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
  const { address, isConnected, chainId, isConnecting, chain } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

  useEffect(() => {
    if (connectError) {
      console.error('Wallet connect error:', connectError)
      toast.error(connectError.message || 'Failed to connect wallet')
    }
  }, [connectError])

  // Sync to store with better fallback
  useEffect(() => {
    if (isConnected && address) {
      const currentChainName = chain?.name || chainNameMap[chainId || 1] || 'Unknown'
      storeConnect(address, chainId || 1, currentChainName)
      if (balanceData?.formatted) setBalance(balanceData.formatted)
      if (chainId) setChain(chainId, currentChainName)
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, chain, balanceData, storeConnect, storeDisconnect, setBalance, setChain])

  const connectWallet = useCallback(() => {
    if (connectors.length === 0) {
      toast.error('No wallet connectors available. Refresh page.')
      return
    }

    const injectedConnector = connectors.find(c => 
      c.type === 'injected' || c.name?.toLowerCase().includes('injected')
    )
    const wcConnector = connectors.find(c => c.name?.toLowerCase().includes('walletconnect'))
    const mmConnector = connectors.find(c => c.name?.toLowerCase().includes('metamask'))

    const preferred = injectedConnector || mmConnector || wcConnector || connectors[0]

    console.log('[Wallet] Attempting to connect with:', preferred.name)
    connect({ connector: preferred })
  }, [connectors, connect])

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    balance: balanceData?.formatted || '0',
    connect: connectWallet,
    disconnect,
    switchChain,
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Unknown',
  }
}