// src/components/app/AppLayoutDesktop.tsx
import { useState } from 'react'
import { IntentExecution } from './useIntentExecution'
import { AppHeader } from './AppHeader'
import { CommandCard } from './CommandCard'
import { HistoryContent } from './HistoryContent'
import { WalletPanelContent } from './WalletPanelContent'
import { TxPreviewContent } from './TxPreviewContent'
import { ConfirmButton } from './ConfirmButton'
import { StatsRow } from './StatsRow'
import { C, uppercaseLabel, borderBottom, PulseDot } from './shared'

interface AppLayoutDesktopProps {
  ctx: IntentExecution
}

// Three-panel command center: left history, center command card, right wallet
// + transaction preview. Side columns flex within a range so the 900-1100px
// band stays comfortable rather than cramped.
export function AppLayoutDesktop({ ctx }: AppLayoutDesktopProps) {
  const {
    commandHistory,
    totalVolume,
    result,
    displayChains,
    fromChainIdx,
    handleNetworkSwitch,
    isConnected,
    address,
    balance,
    chainName,
    connect,
    disconnect,
    isConfirming,
    isSending,
    isWaiting,
    handleConfirm,
    approval,
  } = ctx

  const [netOpen, setNetOpen] = useState(false)
  const settledCount = commandHistory.filter(c => c.status === 'completed').length

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '56px 1fr',
        gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr) minmax(280px, 340px)',
        background: C.bg,
        fontFamily: "'DM Mono',monospace",
      }}
    >
      <AppHeader ctx={ctx} />

      <aside
        style={{
          gridColumn: 1,
          gridRow: 2,
          borderRight: `1px solid ${C.border}`,
          background: C.panel,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem 0.75rem',
            ...borderBottom,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ ...uppercaseLabel, fontSize: '0.65rem', letterSpacing: '0.14em' }}>
            Command History
          </span>
          <span
            style={{
              background: C.surface2,
              color: C.body,
              fontSize: '0.6rem',
              padding: '0.15rem 0.45rem',
              borderRadius: 10,
            }}
          >
            {commandHistory.length}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          <HistoryContent commandHistory={commandHistory} isConnected={ctx.isConnected} />
        </div>
        <div style={{ padding: '0.75rem 1.25rem', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <StatsRow totalVolume={totalVolume} settled={settledCount} total={commandHistory.length} />
        </div>
      </aside>

      <main
        style={{
          gridColumn: 2,
          gridRow: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <style>{`@keyframes ambientPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 500,
            height: 500,
            background: 'radial-gradient(ellipse, rgba(100,100,100,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'ambientPulse 6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />
        <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1, margin: 'auto' }}>
          <CommandCard ctx={ctx} onOpenNetwork={() => setNetOpen(true)} />
        </div>

        {netOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 210 }} onClick={() => setNetOpen(false)} />
            <div
              style={{
                position: 'absolute',
                top: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 211,
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                minWidth: 200,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ padding: '0.55rem 1rem', ...uppercaseLabel, ...borderBottom }}>Source network</div>
              {displayChains.map((chain, idx) => (
                <button
                  key={chain}
                  onClick={() => {
                    handleNetworkSwitch(idx)
                    setNetOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1rem',
                    fontSize: '0.72rem',
                    color: fromChainIdx === idx ? C.max : C.body,
                    background: fromChainIdx === idx ? C.surface : 'none',
                    width: '100%',
                    border: 'none',
                    borderBottom: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    fontFamily: "'DM Mono',monospace",
                    textAlign: 'left',
                  }}
                >
                  <PulseDot connected={fromChainIdx === idx} />
                  {chain}
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      <aside
        style={{
          gridColumn: 3,
          gridRow: 2,
          borderLeft: `1px solid ${C.border}`,
          background: C.panel,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0, ...borderBottom }}>
          <div
            style={{
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ ...uppercaseLabel, fontSize: '0.62rem', letterSpacing: '0.14em' }}>Wallet</span>
          </div>
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <WalletPanelContent
              isConnected={isConnected}
              address={address}
              balance={balance}
              chainName={chainName}
              connect={connect}
              disconnect={disconnect}
            />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', ...borderBottom, flexShrink: 0 }}>
            <span style={{ ...uppercaseLabel, fontSize: '0.62rem', letterSpacing: '0.14em' }}>
              Transaction Preview
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
            <TxPreviewContent
              result={result}
              displayChains={displayChains}
              feeInfo={ctx.feeInfo}
              tokens={ctx.tokens}
              tokenTotal={ctx.tokenTotal}
              tokenQuery={ctx.tokenQuery}
              onTokenQuery={ctx.setTokenQuery}
              approval={approval}
            />
          </div>
          {result && (
            <div style={{ padding: '0 1.25rem 1.25rem', flexShrink: 0 }}>
              <ConfirmButton
                result={result}
                approval={approval}
                isConfirming={isConfirming}
                isSending={isSending}
                isWaiting={isWaiting}
                onConfirm={handleConfirm}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
