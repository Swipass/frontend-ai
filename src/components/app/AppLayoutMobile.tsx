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
import { C, displayFont, Icon, PulseDot } from './shared'

interface AppLayoutMobileProps {
  ctx: IntentExecution
}

// Single-column layout for phones and small tablets (< 900px): bottom tab bar
// (Command / Preview / History) plus bottom-sheet drawers for Wallet + Network.
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
    commandHistory,
    totalVolume,
    mobileTab,
    setMobileTab,
    isConfirming,
    isSending,
    isWaiting,
    handleConfirm,
    approval,
  } = ctx

  const [sheetWallet, setSheetWallet] = useState(false)
  const [sheetNetwork, setSheetNetwork] = useState(false)

  const settledCount = commandHistory.filter(c => c.status === 'completed').length

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
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          background: C.panel,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 1rem',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            ...displayFont,
            fontSize: '0.95rem',
            fontWeight: 800,
            color: C.max,
            letterSpacing: '-0.03em',
            textDecoration: 'none',
          }}
        >
          <Wordmark textClassName="text-sm" />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setSheetWallet(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              border: `1px solid ${C.border}`,
              borderRadius: 40,
              background: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.68rem',
              color: isConnected ? C.body : C.muted,
              transition: 'all 0.2s',
            }}
          >
            <PulseDot connected={isConnected} />
            {isConnected ? `${address?.slice(0, 4)}...${address?.slice(-3)}` : 'Wallet'}
          </button>

          <button
            onClick={() => setSheetNetwork(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.6rem',
              border: `1px solid ${C.border}`,
              borderRadius: 40,
              background: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.68rem',
              color: C.muted,
            }}
          >
            {displayChains[fromChainIdx]?.slice(0, 3) || '...'}
            <Icon.ChevronDown size={9} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any, position: 'relative' }}>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${C.surface2} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, padding: '1.25rem 1rem', paddingBottom: '5rem' }}>
          {mobileTab === 'command' && (
            <CommandCard ctx={ctx} onOpenNetwork={() => setSheetNetwork(true)} />
          )}

          {mobileTab === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              {result && (
                <ConfirmButton
                  result={result}
                  approval={approval}
                  isConfirming={isConfirming}
                  isSending={isSending}
                  isWaiting={isWaiting}
                  onConfirm={handleConfirm}
                />
              )}
            </div>
          )}

          {mobileTab === 'history' && (
            <div>
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                }}
              >
                <StatsRow
                  totalVolume={totalVolume}
                  settled={settledCount}
                  total={commandHistory.length}
                  centered
                />
              </div>
              <HistoryContent commandHistory={commandHistory} isConnected={ctx.isConnected} />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: C.panel,
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 200,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              padding: '0.6rem 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: mobileTab === tab.id ? C.max : C.muted,
              borderTop: `2px solid ${mobileTab === tab.id ? C.max : 'transparent'}`,
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            <tab.Icon size={18} />
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {tab.label}
            </span>
            {tab.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 'calc(50% - 16px)',
                  background: C.mid,
                  color: C.max,
                  borderRadius: 10,
                  fontSize: '0.5rem',
                  padding: '0.05rem 0.35rem',
                  minWidth: 14,
                  textAlign: 'center',
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {tab.badge}
              </div>
            )}
          </button>
        ))}
      </div>

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

      <BottomSheet
        open={sheetNetwork}
        onClose={() => setSheetNetwork(false)}
        title="Select Network"
        maxHeight="75vh"
      >
        {displayChains.map((chain, idx) => (
          <button
            key={chain}
            onClick={async () => {
              await handleNetworkSwitch(idx)
              setSheetNetwork(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.9rem 0',
              width: '100%',
              border: 'none',
              borderBottom: `1px solid ${C.border}`,
              background: 'none',
              color: fromChainIdx === idx ? C.max : C.body,
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <PulseDot connected={fromChainIdx === idx} size={7} />
            {chain}
            {fromChainIdx === idx && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.65rem',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Selected
              </span>
            )}
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
