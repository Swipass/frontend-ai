// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable. WalletConnect may not work.')
}

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],

  connectors: [
    // Web wallets (MetaMask, Brave, etc.)
    injected({
      shimDisconnect: true,
    }),

    // Mobile wallets (WalletConnect)
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Your App Name',
        description: 'Your App Description',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: ['https://yourdomain.com/icon.png'],
      },
    }),
  ],

  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [gnosis.id]: http(),
  },
})