// src/components/WalletProvider.tsx
// Supplies the wallet context to the routes that need one, with a chain list
// fetched from the backend rather than compiled into the bundle.
//
// It wraps only the wallet-using routes on purpose. The landing page, the docs
// and sign-in must render whether or not the API is reachable, so they are not
// behind this boundary and an API outage never takes the site down.
//
// The resolved chain list is cached in the browser, so a return visit configures
// the wallet instantly and still works through a brief backend hiccup. The cache
// is a copy of what the backend last said, never a substitute for asking.
import { ReactNode, useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { buildConfig } from '../config/wagmi'
import { intentService, ChainInfo } from '../services/intentService'

const CACHE_KEY = 'swipass.chains.v1'

function readCache(): ChainInfo[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function writeCache(chains: ChainInfo[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(chains))
  } catch {
    // A browser that refuses storage still works; it just refetches every load.
  }
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-deepest-dark px-6 text-center">
      {children}
    </div>
  )
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ReturnType<typeof buildConfig> | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Show the cached chains immediately, then reconcile with the backend.
    const cached = readCache()
    if (cached) {
      try {
        setConfig(buildConfig(cached))
      } catch {
        // Fall through to the fetch below.
      }
    }

    intentService
      .getChains()
      .then(chains => {
        if (cancelled || chains.length === 0) return
        writeCache(chains)
        setConfig(buildConfig(chains))
      })
      .catch(() => {
        if (!cancelled && !cached) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (failed) {
    return (
      <Centered>
        <div className="max-w-sm">
          <p className="font-display text-lg text-almost-white mb-2">Networks unavailable</p>
          <p className="text-sm text-light-grey-1 leading-relaxed mb-5">
            Swipass could not reach the API to load its supported networks, so the wallet cannot be
            configured. Nothing has been sent anywhere.
          </p>
          <button onClick={() => window.location.reload()} className="sw-btn sw-btn-primary text-xs py-2 px-4">
            Try again
          </button>
        </div>
      </Centered>
    )
  }

  if (!config) {
    return (
      <Centered>
        <div className="w-6 h-6 border-2 border-mid-grey border-t-almost-white rounded-full animate-spin" />
      </Centered>
    )
  }

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </WagmiProvider>
  )
}
