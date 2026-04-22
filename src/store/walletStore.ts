
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
}))
