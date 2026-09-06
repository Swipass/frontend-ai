// src/components/app/CommandResults.tsx
// Everything the command card shows below the input box: loading state, the
// provider quote table, the mobile confirm button, quick commands, and the
// long-pending warning.
import { IntentExecution } from './useIntentExecution'
import { ProviderTable } from './ProviderTable'
import { ConfirmButton } from './ConfirmButton'
import { C, uppercaseLabel, Icon } from './shared'

export function CommandResults({ ctx }: { ctx: IntentExecution }) {
  const {
    setCommand,
    loading,
    result,
    selectedProvider,
    handleSelectProvider,
    ratings,
    isConfirming,
    isSending,
    isWaiting,
    handleConfirm,
    pendingWarning,
    txHash,
    isMobile,
    quickCommands,
  } = ctx

  return (
    <>
      {loading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `1px solid ${C.muted}`,
                borderTopColor: C.hi,
                borderRadius: '50%',
              }}
              className="spinner"
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 6,
                height: 6,
                background: C.body,
                borderRadius: '50%',
              }}
            />
          </div>
          <div style={{ fontSize: '0.78rem', color: C.muted }}>Processing your command...</div>
        </div>
      )}

      {result && !loading && (
        <ProviderTable
          result={result}
          selectedProvider={selectedProvider}
          onSelectProvider={handleSelectProvider}
          ratings={ratings}
        />
      )}

      {result && !loading && isMobile && (
        <ConfirmButton
          result={result}
          isConfirming={isConfirming}
          isSending={isSending}
          isWaiting={isWaiting}
          onConfirm={handleConfirm}
        />
      )}

      {!loading && !result && (
        <div>
          <div style={{ ...uppercaseLabel, marginBottom: '0.6rem', display: 'block' }}>Quick Commands</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {quickCommands.map((c, i) => (
              <button
                key={i}
                onClick={() => setCommand(c)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 40,
                  fontSize: '0.72rem',
                  color: C.muted,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'DM Mono',monospace",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = C.surface)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingWarning && txHash && (
        <div
          style={{
            padding: '0.6rem 0.75rem',
            background: C.surface2,
            border: `1px solid ${C.mid}`,
            borderRadius: 5,
            fontSize: '0.68rem',
            color: C.label,
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
          }}
        >
          <Icon.Warning size={12} />
          <span>
            Transaction is taking longer than usual. It may be stuck due to network congestion or low
            gas. You can speed up or cancel in your wallet.
          </span>
        </div>
      )}
    </>
  )
}
