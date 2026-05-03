// src/hooks/useWallet.ts
import { useAccount, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'   // ← Correct import
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'

const chainNameMap: Record<number, string> = {
  1: 'Ethereum', 42161: 'Arbitrum', 8453: 'Base', 10: 'Optimism',
  137: 'Polygon', 43114: 'Avalanche', 56: 'BNB Chain', 100: 'Gnosis',
}

export function useWallet() {
  const { address, isConnected, chainId, isConnecting, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const { open } = useWeb3Modal()
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

  const connect = () => open()

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    balance: balanceData?.formatted || '0',
    connect,
    disconnect,
    switchChain,
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Ethereum',
  }
}