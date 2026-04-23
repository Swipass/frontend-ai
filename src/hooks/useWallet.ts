import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useEffect } from 'react'
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

  // Show connection errors
  useEffect(() => {
    if (connectError) {
      toast.error(connectError.message)
    }
  }, [connectError])

  // Sync wallet state to zustand store
  useEffect(() => {
    if (isConnected && address) {
      storeConnect(address, chainId || 1, chainNameMap[chainId || 1] || 'Unknown')
      if (balanceData) setBalance(balanceData.formatted)
      if (chainId) setChain(chainId, chainNameMap[chainId] || 'Unknown')
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, balanceData, storeConnect, storeDisconnect, setBalance, setChain])

  const connectWallet = () => {
    if (connectors.length === 0) {
      toast.error('No wallet connector available')
      return
    }
    connect({ connector: connectors[0] })
  }

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