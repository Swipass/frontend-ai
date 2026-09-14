
// src/store/walletStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  address: string | null
  chainId: number | null
  chainName: string | null
  balance: string
  isConnected: boolean
  connect: (address: string, chainId: number, chainName: string) => void
  disconnect: () => void
  setBalance: (b: string) => void
  setChain: (id: number, name: string) => void
  // wagmi's WalletConnect connector caches its EthereumProvider in a closure
  // with no external reset: once a connect attempt stalls mid-init, that
  // promise never settles and every future attempt on the same connector
  // (and, since RainbowKit shares one connector instance across Safe,
  // Rainbow, MetaMask and Trust Wallet, every future attempt on any of
  // those) awaits the same dead promise for the rest of the page's life.
  // Bumping this token tells WalletProvider to mint a brand-new WagmiConfig
  // (fresh connectors, fresh closures) so the next attempt isn't stuck
  // reusing a connector that already proved it can't recover.
  connectionResetToken: number
  requestConnectionReset: () => void
}

export const useWalletStore = create<WalletState>()((set) => ({
  address: null,
  chainId: null,
  chainName: null,
  balance: '0',
  isConnected: false,
  connect: (address, chainId, chainName) =>
    set({ address, chainId, chainName, isConnected: true }),
  disconnect: () =>
    set({ address: null, chainId: null, chainName: null, balance: '0', isConnected: false }),
  setBalance: (balance) => set({ balance }),
  setChain: (chainId, chainName) => set({ chainId, chainName }),
  connectionResetToken: 0,
  requestConnectionReset: () => set(s => ({ connectionResetToken: s.connectionResetToken + 1 })),
}))
