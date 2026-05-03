// src/hooks/useWallet.ts
import { useAccount, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../store/walletStore'

const chainNameMap: Record<number, string> = { /* same as before */ }

export function useWallet() {
  const { address, isConnected, chainId, isConnecting, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const { connect: storeConnect, disconnect: storeDisconnect, setBalance, setChain } = useWalletStore()

  useEffect(() => {
    if (isConnected && address) {
      const chName = chain?.name || chainNameMap[chainId || 1] || 'Unknown'
      storeConnect(address, chainId || 1, chName)
      if (balanceData?.formatted) setBalance(balanceData.formatted)
      if (chainId) setChain(chainId, chName)
    } else {
      storeDisconnect()
    }
  }, [isConnected, address, chainId, chain, balanceData])

  const connect = () => {
    // Web3Modal will handle the UI
    // You can trigger it via a button that opens the modal
    // For now, we'll use a simple trigger (see below)
    toast.info('Opening wallet modal...')
    // The modal is automatically handled by Web3Modal
  }

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    balance: balanceData?.formatted || '0',
    connect,
    disconnect,
    switchChain,
    chainName: chain?.name || chainNameMap[chainId || 1] || 'Unknown',
  }
}