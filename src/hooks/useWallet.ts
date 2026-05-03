// src/hooks/useWallet.ts
import { useAccount, useBalance, useSwitchChain } from 'wagmi'
import { useEffect } from 'react'
import { useWalletStore } from '../store/walletStore'

const chainNameMap: Record<number, string> = {
  1: 'Ethereum', 42161: 'Arbitrum', 8453: 'Base', 10: 'Optimism',
  137: 'Polygon', 43114: 'Avalanche', 56: 'BNB Chain', 100: 'Gnosis',
}

export function useWallet() {
  const { address, isConnected, chainId, chain } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { switchChainAsync } = useSwitchChain()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

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

  return {
    address,
    isConnected,
    chainId,
    balance: balanceData?.formatted || '0',
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Ethereum',
    switchChainAsync,   // ← now available for automatic chain switching
  }
}