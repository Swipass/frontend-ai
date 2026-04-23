// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable')
}

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Swipass',
        description: 'Universal cross-chain intent & execution platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://swipass.xyz',
        icons: ['https://swipass.xyz/icon.png'],
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