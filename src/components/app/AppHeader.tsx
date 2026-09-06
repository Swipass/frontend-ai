// src/components/app/AppHeader.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IntentExecution } from './useIntentExecution'
import { C, displayFont, Icon, PulseDot } from './shared'
import { Wordmark } from '../Logo'

interface AppHeaderProps {
  ctx: IntentExecution
}

// Desktop command-center header: brand, nav, network picker, wallet, dashboard.
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
    <header
      style={{
        gridColumn: '1/-1',
        gridRow: 1,
        background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            ...displayFont,
            fontSize: '1rem',
            fontWeight: 800,
            color: C.max,
            letterSpacing: '-0.03em',
            textDecoration: 'none',
          }}
        >
          <Wordmark textClassName="text-base" />
        </Link>
        <nav style={{ display: 'flex', gap: 0, borderLeft: `1px solid ${C.border}`, paddingLeft: '1.5rem' }}>
          {[
            ['App', '/app'],
            ['Dashboard', '/dashboard'],
            ['Docs', '/docs'],
          ].map(([label, href]) => (
            <Link
              key={label}
              to={href}
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: href === '/app' ? C.max : C.muted,
                padding: '0.3rem 0.75rem',
                borderRadius: 3,
                background: href === '/app' ? C.surface2 : 'transparent',
                transition: 'all 0.3s',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={e => {
              e.stopPropagation()
              setNetworkOpen(o => !o)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              border: `1px solid ${C.border}`,
              borderRadius: 40,
              fontSize: '0.7rem',
              color: C.body,
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: "'DM Mono',monospace",
            }}
          >
            <PulseDot connected={isConnected} />
            {isConnected ? chainName : 'Select Network'}
            <Icon.ChevronDown size={10} />
          </button>
          {networkOpen && !chainsLoading && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 190 }} onClick={() => setNetworkOpen(false)} />
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  minWidth: 180,
                  zIndex: 200,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {displayChains.map((chain, idx) => (
                  <button
                    key={chain}
                    onClick={() => {
                      handleNetworkSwitch(idx)
                      setNetworkOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.72rem',
                      color: fromChainIdx === idx ? C.max : C.body,
                      background: fromChainIdx === idx ? C.surface : 'none',
                      width: '100%',
                      border: 'none',
                      borderBottom: `1px solid ${C.border}`,
                      cursor: 'pointer',
                      fontFamily: "'DM Mono',monospace",
                      transition: 'background 0.2s',
                    }}
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
          onClick={isConnected ? disconnect : connect}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: isConnected ? C.surface : C.max,
            color: isConnected ? C.label : C.bg,
            border: isConnected ? `1px solid ${C.border}` : 'none',
            borderRadius: 4,
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
        </button>
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: C.muted,
            padding: '0.4rem 0.75rem',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            transition: 'all 0.3s',
            textDecoration: 'none',
          }}
        >
          <Icon.Grid size={11} />
          Dashboard
        </Link>
      </div>
    </header>
  )
}
