// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim()

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

const appUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://swipass.com'

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({ 
      shimDisconnect: true 
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Swipass',
        description: 'Universal Cross-Chain Intent & Execution Platform',
        url: appUrl,
        icons: ['https://swipass.com/logo192.png'],
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