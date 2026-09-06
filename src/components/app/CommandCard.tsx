// src/components/app/CommandCard.tsx
import { IntentExecution } from './useIntentExecution'
import { CommandResults } from './CommandResults'
import { C, Spinner, Icon, PulseDot } from './shared'

interface CommandCardProps {
  ctx: IntentExecution
  onOpenNetwork: () => void
}

export function CommandCard({ ctx, onOpenNetwork }: CommandCardProps) {
  const {
    isConnected,
    balance,
    chainName,
    command,
    setCommand,
    textareaRef,
    isRecording,
    toggleRecording,
    displayChains,
    chainsLoading,
    fromChainIdx,
    destAddress,
    setDestAddress,
    showDestInput,
    setShowDestInput,
    loading,
    result,
    handleSubmit,
    isMobile,
  } = ctx

  const submitDisabled = !command.trim() || loading || chainsLoading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          opacity: isConnected ? 1 : 0.7,
          transition: 'opacity 0.4s',
        }}
      >
        <PulseDot connected={isConnected} />
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.muted,
            textAlign: 'center',
          }}
        >
          {isConnected ? `Connected (${balance} ${chainName}) - Ready` : 'Connect wallet to begin'}
        </span>
      </div>

      <div
        style={{
          background: C.panel,
          border: `1px solid ${loading ? C.muted : result ? C.body : C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          boxShadow: result ? `0 0 0 3px rgba(102,102,102,0.08)` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '1rem 1rem 0' }}>
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            style={{
              width: 40,
              height: 40,
              border: `1px solid ${isRecording ? C.body : C.border}`,
              borderRadius: 8,
              background: isRecording ? C.mid : C.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              color: isRecording ? C.max : C.muted,
              transition: 'all 0.3s',
            }}
          >
            <Icon.Mic size={16} />
          </button>
          <div style={{ flex: 1, padding: '0 0.75rem', minWidth: 0 }}>
            <textarea
              ref={textareaRef}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder={
                isMobile ? 'Speak or type a command...' : 'Send 50 USDC from Arbitrum to Base...'
              }
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: "'DM Mono',monospace",
                fontSize: isMobile ? '1rem' : '0.9rem',
                color: C.hi,
                lineHeight: 1.6,
                minHeight: 72,
                caretColor: C.label,
              }}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>
        </div>

        <div style={{ padding: '0 1rem 0.5rem', paddingLeft: 'calc(1rem + 40px + 0.75rem)' }}>
          <button
            onClick={() => setShowDestInput(!showDestInput)}
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.mid,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono',monospace",
              padding: 0,
            }}
          >
            {showDestInput ? '- Hide' : '+ Custom destination address'}
          </button>
          {showDestInput && (
            <input
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              placeholder="0x... destination address (optional)"
              style={{
                display: 'block',
                width: '100%',
                marginTop: '0.5rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '0.45rem 0.75rem',
                fontFamily: "'DM Mono',monospace",
                fontSize: '0.75rem',
                color: C.body,
                outline: 'none',
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <button
              onClick={onOpenNetwork}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                fontSize: '0.68rem',
                color: C.body,
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: "'DM Mono',monospace",
                whiteSpace: 'nowrap',
              }}
            >
              <Icon.Swap size={10} />
              {isMobile
                ? displayChains[fromChainIdx] || 'Chain'
                : `From: ${displayChains[fromChainIdx] || 'Loading...'}`}
            </button>
            {!isMobile && <span style={{ fontSize: '0.62rem', color: C.mid }}>Cmd + Enter to send</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitDisabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: isMobile ? '0.55rem 1.1rem' : '0.5rem 1.25rem',
              background: submitDisabled ? C.mid : C.max,
              color: submitDisabled ? C.muted : C.bg,
              border: 'none',
              borderRadius: 6,
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {loading ? (
              <>
                <Spinner size={13} light /> Processing
              </>
            ) : (
              'Execute'
            )}
          </button>
        </div>
      </div>

      <CommandResults ctx={ctx} />
    </div>
  )
}
