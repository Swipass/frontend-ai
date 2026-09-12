// src/components/app/AppHeader.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IntentExecution } from './useIntentExecution'
import { Icon, PulseDot } from './shared'
import { Wordmark } from '../Logo'

interface AppHeaderProps {
  ctx: IntentExecution
}

const NAV: [string, string][] = [
  ['App', '/app'],
  ['Docs', '/docs'],
  ['Dashboard', '/dashboard'],
]

// Desktop command-center header: brand, a pill of destinations, the network
// picker, the wallet, and a shortcut to the developer dashboard.
export function AppHeader({ ctx }: AppHeaderProps) {
  const {
    isConnected,
    chainName,
    address,
    connect,
    disconnect,
    displayChains,
    fromChainIdx,
    handleNetworkSwitch,
    chainsLoading,
  } = ctx
  const [networkOpen, setNetworkOpen] = useState(false)

  return (
    <header style={{ gridColumn: '1/-1', gridRow: 1 }} className="relative z-[100] flex items-center justify-between px-2">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-[color:var(--ink)]" aria-label="Swipass home">
          <Wordmark textClassName="text-[1.3rem]" />
        </Link>
        <nav aria-label="App" className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 backdrop-blur-xl">
          {NAV.map(([label, href]) => (
            <Link
              key={label}
              to={href}
              aria-current={href === '/app' ? 'page' : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[0.82rem] transition-colors duration-300 ${
                href === '/app'
                  ? 'bg-white/[0.1] text-[color:var(--ink)]'
                  : 'text-[color:var(--ink-3)] hover:bg-white/[0.05] hover:text-[color:var(--ink)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              setNetworkOpen(o => !o)
            }}
            className="chip h-10 px-4 text-[0.82rem] transition-colors hover:border-white/20"
          >
            <PulseDot connected={isConnected} />
            {isConnected ? chainName : 'Select network'}
            <Icon.ChevronDown size={10} />
          </button>
          {networkOpen && !chainsLoading && (
            <>
              <div className="fixed inset-0 z-[190]" onClick={() => setNetworkOpen(false)} />
              <div
                onClick={e => e.stopPropagation()}
                className="glass app-rise absolute right-0 top-[calc(100%+8px)] z-[200] min-w-[230px] overflow-hidden p-1.5"
              >
                <div className="kicker px-3 pb-2 pt-2">Network</div>
                {displayChains.map((chain, idx) => (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => {
                      handleNetworkSwitch(idx)
                      setNetworkOpen(false)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.86rem] transition-colors ${
                      fromChainIdx === idx
                        ? 'bg-white/[0.08] text-[color:var(--ink)]'
                        : 'text-[color:var(--ink-3)] hover:bg-white/[0.04] hover:text-[color:var(--ink)]'
                    }`}
                  >
                    <PulseDot connected={fromChainIdx === idx} />
                    {chain}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          title={isConnected ? 'Disconnect wallet' : undefined}
          className={`pill h-10 ${isConnected ? 'pill-dark f-mono text-[0.8rem]' : 'pill-light'}`}
        >
          {isConnected ? (
            <>
              <PulseDot connected />
              {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </>
          ) : (
            'Connect wallet'
          )}
        </button>

        <Link
          to="/dashboard"
          aria-label="Developer dashboard"
          title="Developer dashboard"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[color:var(--ink-2)] transition-colors hover:bg-white/[0.08] hover:text-[color:var(--ink)]"
        >
          <Icon.Grid size={14} />
        </Link>
      </div>
    </header>
  )
}
