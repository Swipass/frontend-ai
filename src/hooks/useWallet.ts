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
  const { address, isConnected, chainId, isConnecting } = useAccount()
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

  // Sync to store
  useEffect(() => {
    if (isConnected && address) {
      storeConnect(address, chainId || 1, chainNameMap[chainId || 1] || 'Unknown')
      if (balanceData?.formatted) setBalance(balanceData.formatted)
      if (chainId) setChain(chainId, chainNameMap[chainId] || 'Unknown')
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, balanceData, storeConnect, storeDisconnect, setBalance, setChain])

  const connectWallet = useCallback(() => {
    if (connectors.length === 0) {
      toast.error('No connectors available')
      return
    }

    // Priority: Injected (mobile browser) → WalletConnect
    const injectedConn = connectors.find(c => 
      c.name?.toLowerCase().includes('injected') || 
      c.type === 'injected'
    )
    
    const wcConn = connectors.find(c => c.name?.toLowerCase().includes('walletconnect'))
    
    const preferred = injectedConn || wcConn || connectors[0]
    
    console.log('Connecting with:', preferred.name)
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
  }
}