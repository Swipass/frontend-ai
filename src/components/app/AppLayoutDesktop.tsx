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
import { PulseDot } from './shared'
import { OrbCanvas } from '../../site/landing/OrbCanvas'

interface AppLayoutDesktopProps {
  ctx: IntentExecution
}

function PanelHeading({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
      <span className="kicker">{title}</span>
      {count !== undefined && (
        <span className="f-mono rounded-full border border-white/[0.1] px-2 py-0.5 text-[0.62rem] text-[color:var(--ink-3)]">
          {count}
        </span>
      )}
    </div>
  )
}

// Three framed panels around a lit stage: history on the left, the command
// card over the orb in the centre, wallet and transaction preview on the right.
// Side columns flex within a range so the 900-1100px band stays comfortable.
export function AppLayoutDesktop({ ctx }: AppLayoutDesktopProps) {
  const {
    commandHistory,
    totalVolume,
    result,
    loading,
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
  const idle = !result && !loading

  return (
    <div
      className="bg-[#070707]"
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '64px minmax(0, 1fr)',
        gridTemplateColumns: 'minmax(230px, 270px) minmax(0, 1fr) minmax(300px, 360px)',
        gap: 8,
        padding: '0 8px 8px',
      }}
    >
      <AppHeader ctx={ctx} />

      <aside className="app-panel flex min-h-0 flex-col overflow-hidden" style={{ gridColumn: 1, gridRow: 2 }}>
        <PanelHeading title="History" count={commandHistory.length} />
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
          <HistoryContent commandHistory={commandHistory} isConnected={isConnected} />
        </div>
        <div className="shrink-0 border-t border-white/[0.06] px-5 py-4">
          <StatsRow totalVolume={totalVolume} settled={settledCount} total={commandHistory.length} />
        </div>
      </aside>

      <main
        className="hero-frame relative flex min-h-0 flex-col items-center overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/[0.07]"
        style={{ gridColumn: 2, gridRow: 2 }}
      >
        <div className="hero-blob hero-blob-a" />
        <div
          className="pointer-events-none absolute left-1/2 top-[60%] aspect-square w-[min(96%,680px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700"
          style={{ opacity: idle ? 0.34 : 0.14 }}
          aria-hidden="true"
        >
          <OrbCanvas />
        </div>

        <div className="relative z-[1] m-auto w-full max-w-[660px] px-6 py-10">
          {idle && (
            <div className="app-rise mb-8 text-center">
              <h1 className="text-[clamp(2.2rem,3.6vw,3.4rem)] font-light leading-[1] tracking-[-0.045em] text-[color:var(--ink)]">
                Say what you <span className="f-serif fade-word pr-1 italic">need.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-[0.92rem] leading-relaxed text-[color:var(--ink-3)]">
                Swipass compares every provider and hands you one transaction to sign.
              </p>
            </div>
          )}
          <CommandCard ctx={ctx} onOpenNetwork={() => setNetOpen(true)} />
        </div>

        {netOpen && (
          <>
            <div className="fixed inset-0 z-[210]" onClick={() => setNetOpen(false)} />
            <div className="glass app-rise absolute left-1/2 top-6 z-[211] min-w-[240px] -translate-x-1/2 overflow-hidden p-1.5">
              <div className="kicker px-3 pb-2 pt-2">Source network</div>
              {displayChains.map((chain, idx) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() => {
                    handleNetworkSwitch(idx)
                    setNetOpen(false)
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
      </main>

      <aside className="app-panel flex min-h-0 flex-col overflow-hidden" style={{ gridColumn: 3, gridRow: 2 }}>
        <PanelHeading title="Wallet" />
        <div className="shrink-0 border-b border-white/[0.06] px-5 py-5">
          <WalletPanelContent
            isConnected={isConnected}
            address={address}
            balance={balance}
            chainName={chainName}
            connect={connect}
            disconnect={disconnect}
          />
        </div>
        <PanelHeading title="Transaction preview" />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
          <div className="shrink-0 px-5 pb-5">
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
      </aside>
    </div>
  )
}
