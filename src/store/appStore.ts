// src/store/appStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CommandHistory {
  id: string
  command: string
  fromChain: string
  toChain: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: number
  txHash?: string
  volumeUsd?: number
}

interface AppState {
  commandHistory: CommandHistory[]
  addCommand: (cmd: Omit<CommandHistory, 'id' | 'timestamp'>) => string
  updateCommand: (id: string, update: Partial<CommandHistory>) => void
  clearHistory: () => void
  systemPaused: boolean
  setSystemPaused: (v: boolean) => void
  userRole: string | null
  setUserRole: (r: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      commandHistory: [],
      addCommand: (cmd) => {
        const id = crypto.randomUUID()
        set((s) => ({
          commandHistory: [
            { ...cmd, id, timestamp: Date.now() },
            ...s.commandHistory.slice(0, 49),
          ],
        }))
        return id
      },
      updateCommand: (id, update) =>
        set((s) => ({
          commandHistory: s.commandHistory.map((c) =>
            c.id === id ? { ...c, ...update } : c
          ),
        })),
      clearHistory: () => set({ commandHistory: [] }),
      systemPaused: false,
      setSystemPaused: (v) => set({ systemPaused: v }),
      userRole: null,
      setUserRole: (r) => set({ userRole: r }),
    }),
    { name: 'swipass-app', partialize: (s) => ({ commandHistory: s.commandHistory }) }
  )
)

// src/store/walletStore.ts
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
