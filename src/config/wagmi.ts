// src/config/wagmi.ts
// The wallet's chain list is built from the backend, not hardcoded here.
//
// /v1/chains is the single source of truth for what Swipass supports: it is the
// union of the active providers' chains, and each entry carries the numeric id,
// native asset, explorer and a public RPC. Enabling a provider that adds a chain
// therefore makes that chain switchable in the wallet with no frontend change.
//
// A static list would have to be kept in step with the backend by hand, and the
// day it drifted the app would offer a network it cannot route, or refuse one it
// can.
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import type { Chain } from 'viem'
import type { ChainInfo } from '../services/intentService'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim()
const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swipass.com'

/** Turn one backend chain record into the chain object viem and wagmi expect. */
export function toViemChain(info: ChainInfo): Chain {
  return defineChain({
    id: info.chain_id,
    name: info.name,
    nativeCurrency: {
      name: info.native_symbol,
      symbol: info.native_symbol,
      decimals: info.native_decimals ?? 18,
    },
    rpcUrls: { default: { http: [info.rpc_url] } },
    blockExplorers: info.explorer
      ? { default: { name: `${info.name} explorer`, url: info.explorer } }
      : undefined,
  })
}

/**
 * Build the wagmi config for a set of chains.
 *
 * WalletConnect needs a Cloud projectId and throws at init without one, so with
 * no projectId we fall back to injected browser wallets only. That is a real
 * degraded mode, not a stub: MetaMask-style wallets work fully.
 */
export function buildConfig(chains: ChainInfo[]) {
  const usable = chains.filter(c => c.chain_id && c.rpc_url)
  if (usable.length === 0) {
    throw new Error('No chains available to configure the wallet with')
  }

  const viemChains = usable.map(toViemChain) as unknown as readonly [Chain, ...Chain[]]
  const transports = Object.fromEntries(usable.map(c => [c.chain_id, http(c.rpc_url)]))

  if (!projectId) {
    return createConfig({
      chains: viemChains,
      transports,
      connectors: [injected({ shimDisconnect: true })],
    })
  }

  return getDefaultConfig({
    appName: 'Swipass',
    projectId,
    chains: viemChains,
    transports,
    appIcon: `${appUrl}/android-chrome-192x192.png`,
    appDescription: 'Universal Cross-Chain Intent & Execution Platform',
  })
}

if (!projectId) {
  console.warn(
    'VITE_WALLETCONNECT_PROJECT_ID is not set: WalletConnect is disabled, ' +
      'injected browser wallets only. Set it to enable WalletConnect.'
  )
}
