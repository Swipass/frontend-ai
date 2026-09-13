// src/components/app/AppLayoutMobile.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IntentExecution } from './useIntentExecution'
import { CommandCard } from './CommandCard'
import { HistoryContent } from './HistoryContent'
import { WalletPanelContent } from './WalletPanelContent'
import { TxPreviewContent } from './TxPreviewContent'
import { ConfirmButton } from './ConfirmButton'
import { BottomSheet } from './BottomSheet'
import { Wordmark } from '../Logo'
import { StatsRow } from './StatsRow'
import { StatusBanner } from './StatusBanner'
import { Icon, PulseDot } from './shared'

interface AppLayoutMobileProps {
  ctx: IntentExecution
}

// Single-column layout for phones and small tablets (< 900px): a framed stage,
// a floating tab bar (Command / Preview / History) and bottom-sheet drawers
// for the wallet and the network.
export function AppLayoutMobile({ ctx }: AppLayoutMobileProps) {
  const {
    isConnected,
    address,
    balance,
    chainName,
    connect,
    disconnect,
    displayChains,
    fromChainIdx,
    handleNetworkSwitch,
    result,
    loading,
    commandHistory,
    totalVolume,
    mobileTab,
    setMobileTab,
    isSending,
    handleConfirm,
    approval,
    txState,
    checkReceiptNow,
  } = ctx

  const [sheetWallet, setSheetWallet] = useState(false)
  const [sheetNetwork, setSheetNetwork] = useState(false)

  const settledCount = commandHistory.filter(c => c.status === 'completed').length
  const idle = !result && !loading

  const tabs = [
    { id: 'command' as const, label: 'Command', Icon: Icon.Command, badge: null as string | number | null },
    { id: 'preview' as const, label: 'Preview', Icon: Icon.Eye, badge: result ? '!' : null },
    {
      id: 'history' as const,
      label: 'History',
      Icon: Icon.Clock,
      badge: commandHistory.length > 0 ? commandHistory.length : null,
    },
  ]

  return (
    <div className="bg-[#070707]" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header className="z-[100] flex h-[60px] shrink-0 items-center justify-between px-4">
        <Link to="/" aria-label="Swipass home" className="text-[color:var(--ink)]">
          <Wordmark textClassName="text-[1.15rem]" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetWallet(true)}
            className={`chip h-9 text-[0.76rem] ${isConnected ? 'f-mono text-[color:var(--ink-2)]' : 'text-[color:var(--ink-3)]'}`}
          >
            <PulseDot connected={isConnected} />
            {isConnected ? `${address?.slice(0, 4)}...${address?.slice(-3)}` : 'Wallet'}
          </button>
          <button
            type="button"
            onClick={() => setSheetNetwork(true)}
            className="chip h-9 text-[0.76rem] text-[color:var(--ink-3)]"
          >
            {displayChains[fromChainIdx]?.slice(0, 3) || '...'}
            <Icon.ChevronDown size={9} />
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' as any }}>
        <div
          className="hero-frame pointer-events-none fixed inset-x-2 bottom-2 top-[60px] overflow-hidden rounded-[1.6rem] border border-white/[0.07]"
          aria-hidden="true"
        >
          <div className="hero-blob hero-blob-a" />
        </div>

        <div className="relative z-[1] px-4 pb-32 pt-7">
          <StatusBanner className="mb-5" />
          {mobileTab === 'command' && (
            <>
              {idle && (
                <div className="app-rise mb-6 text-center">
                  <h1 className="text-[2.3rem] font-light leading-[1] tracking-[-0.045em] text-[color:var(--ink)]">
                    Say what you <span className="f-serif fade-word pr-1 italic">need.</span>
                  </h1>
                  <p className="mx-auto mt-3 max-w-[18rem] text-[0.88rem] leading-relaxed text-[color:var(--ink-3)]">
                    Swipass compares every provider and hands you one transaction to sign.
                  </p>
                </div>
              )}
              <CommandCard ctx={ctx} onOpenNetwork={() => setSheetNetwork(true)} />
            </>
          )}

          {mobileTab === 'preview' && (
            <div className="app-rise flex flex-col gap-3">
              <div className="app-panel p-4">
                <div className="kicker mb-4">Transaction preview</div>
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
                <ConfirmButton
                  result={result}
                  approval={approval}
                  txState={txState}
                  isSending={isSending}
                  onConfirm={handleConfirm}
                  onCheckReceipt={checkReceiptNow}
                />
              )}
            </div>
          )}

          {mobileTab === 'history' && (
            <div className="app-rise flex flex-col gap-3">
              <div className="app-panel px-4 py-5">
                <StatsRow totalVolume={totalVolume} settled={settledCount} total={commandHistory.length} centered />
              </div>
              <div className="app-panel px-2 py-1">
                <HistoryContent commandHistory={commandHistory} isConnected={isConnected} />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav
        aria-label="App sections"
        className="fixed inset-x-3 z-[200] flex items-center gap-1 rounded-full border border-white/[0.1] bg-[#111111]/85 p-1.5 backdrop-blur-2xl"
        style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.9)' }}
      >
        {tabs.map(tab => {
          const active = mobileTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[0.78rem] transition-all duration-300 ${
                active ? 'bg-[color:var(--ink)] text-[#0a0a0a]' : 'text-[color:var(--ink-3)]'
              }`}
            >
              <tab.Icon size={16} />
              {tab.label}
              {tab.badge && !active && (
                <span className="f-mono absolute right-2 top-1 min-w-[1rem] rounded-full bg-white/20 px-1 text-center text-[0.55rem] leading-4 text-[color:var(--ink)]">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <BottomSheet open={sheetWallet} onClose={() => setSheetWallet(false)} title="Wallet" maxHeight="70vh">
        <WalletPanelContent
          isConnected={isConnected}
          address={address}
          balance={balance}
          chainName={chainName}
          connect={connect}
          disconnect={disconnect}
        />
      </BottomSheet>

      <BottomSheet open={sheetNetwork} onClose={() => setSheetNetwork(false)} title="Select network" maxHeight="75vh">
        <div className="flex flex-col gap-1">
          {displayChains.map((chain, idx) => (
            <button
              key={chain}
              type="button"
              onClick={async () => {
                await handleNetworkSwitch(idx)
                setSheetNetwork(false)
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-[0.95rem] transition-colors ${
                fromChainIdx === idx ? 'bg-white/[0.07] text-[color:var(--ink)]' : 'text-[color:var(--ink-2)]'
              }`}
            >
              <PulseDot connected={fromChainIdx === idx} size={7} />
              {chain}
              {fromChainIdx === idx && (
                <span className="f-mono ml-auto text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--ink-4)]">
                  Selected
                </span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
