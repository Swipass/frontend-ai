// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect, metaMask } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable')
}

// Use the actual deployed URL or localhost
const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipass.com'

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  connectors: [
    // Injected wallets (MetaMask, Trust Wallet, Rainbow, etc. in mobile browsers)
    injected({ 
      shimDisconnect: true 
    }),
    
    // WalletConnect (QR + deep linking for mobile apps)
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Swipass',
        description: 'Universal cross-chain intent execution',
        url: appUrl,
        icons: [], // leave empty to avoid missing file errors
      },
    }),

    // Explicit MetaMask connector (improves mobile detection)
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