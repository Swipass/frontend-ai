// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect, metaMask } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable')
}

const appUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://swipass.xyz'

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  connectors: [
    // Injected first — best for mobile browsers (MetaMask, Trust, etc.)
    injected({ 
      shimDisconnect: true,
      target: 'metaMask' // helps with common mobile injected wallets
    }),
    
    // WalletConnect for QR + deep linking
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Swipass',
        description: 'Universal Cross-Chain Intent & Execution Platform',
        url: appUrl,
        icons: ['https://swipass.xyz/logo192.png'], // use a real icon if possible
      },
    }),

    metaMask({
      dappMetadata: {
        name: 'Swipass',
        url: appUrl,
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