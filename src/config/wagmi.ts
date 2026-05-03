// src/config/wagmi.ts
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis } from 'wagmi/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim()

if (!projectId) {
  console.error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

// Always use the current origin – works for any domain (localhost, swipass.com, etc.)
const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipass.com'

export const config = getDefaultConfig({
  appName: 'Swipass',
  projectId,
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche, bsc, gnosis],
  transports: {
    [mainnet.id]:     http('https://cloudflare-eth.com'),
    [arbitrum.id]:    http('https://arb1.arbitrum.io/rpc'),
    [base.id]:        http('https://mainnet.base.org'),
    [optimism.id]:    http('https://mainnet.optimism.io'),
    [polygon.id]:     http('https://polygon-rpc.com'),
    [avalanche.id]:   http('https://api.avax.network/ext/bc/C/rpc'),
    [bsc.id]:         http('https://bsc-dataseed.binance.org'),
    [gnosis.id]:      http('https://rpc.gnosischain.com'),
  },
  appIcon: `${appUrl}/android-chrome-192x192.png`,
  appDescription: 'Universal Cross-Chain Intent & Execution Platform',

  // 🔥 This is what was missing – tells wallets how to get back to your dapp
  walletConnectParameters: {
    redirect: {
      universal: appUrl,   // fallback URL for any wallet
      // native: 'swipass://',   // only needed if you have a native app
    },
  },
})