// src/store/appStore.ts
// In-memory only (no persistence): the app's transaction history comes from the
// connected wallet via the backend, not a device-local store. This holds only
// the current session's in-flight commands for optimistic display.
import { create } from 'zustand'

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

export const useAppStore = create<AppState>()((set, get) => ({
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
}))

// The canonical wallet store lives in src/store/walletStore.ts.
