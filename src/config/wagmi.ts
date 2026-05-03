// src/config/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim()

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipass.com'

export const config = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [base.id]: http('https://mainnet.base.org'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
    [gnosis.id]: http('https://rpc.gnosischain.com'),
  },
})

// Initialize Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
})