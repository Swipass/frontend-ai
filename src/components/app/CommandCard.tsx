// src/components/app/CommandCard.tsx
import { IntentExecution } from './useIntentExecution'
import { CommandResults } from './CommandResults'
import { Spinner, Icon, PulseDot } from './shared'

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
  const state = loading ? 'loading' : result ? 'result' : 'idle'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <span className={`chip text-[0.78rem] transition-opacity duration-500 ${isConnected ? '' : 'opacity-80'}`}>
          <PulseDot connected={isConnected} />
          {isConnected ? `Connected · ${balance} on ${chainName}` : 'Connect a wallet to begin'}
        </span>
      </div>

      <div className="app-command" data-state={state}>
        <div className="flex items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <button
            type="button"
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
              isRecording
                ? 'app-mic-live border-transparent bg-[color:var(--ink)] text-[#0a0a0a]'
                : 'border-white/[0.12] bg-white/[0.04] text-[color:var(--ink-2)] hover:bg-white/[0.08] hover:text-[color:var(--ink)]'
            }`}
          >
            <Icon.Mic size={17} />
          </button>
          <textarea
            ref={textareaRef}
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder={isMobile ? 'Speak or type a command...' : 'Send 50 USDC from Arbitrum to Base...'}
            rows={3}
            className="min-h-[5.25rem] w-full min-w-0 flex-1 resize-none bg-transparent pt-2 font-light leading-[1.5] tracking-[-0.01em] text-[color:var(--ink)] outline-none"
            style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', caretColor: 'var(--ink)' }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
        </div>

        <div className="px-4 pb-3 pl-[calc(1rem+44px+0.75rem)] sm:px-5 sm:pl-[calc(1.25rem+44px+0.75rem)]">
          <button
            type="button"
            onClick={() => setShowDestInput(!showDestInput)}
            className="text-[0.78rem] text-[color:var(--ink-4)] transition-colors hover:text-[color:var(--ink-2)]"
          >
            {showDestInput ? 'Hide destination' : '+ Send to a different address'}
          </button>
          {showDestInput && (
            <input
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              placeholder="0x... destination address (optional)"
              className="f-mono app-rise mt-2 block w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-[0.8rem] text-[color:var(--ink-2)] outline-none transition-colors focus:border-white/25"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onOpenNetwork}
              className="chip whitespace-nowrap text-[0.8rem] transition-colors hover:border-white/20"
            >
              <Icon.Swap size={12} />
              {isMobile ? displayChains[fromChainIdx] || 'Chain' : `From ${displayChains[fromChainIdx] || 'loading...'}`}
              <Icon.ChevronDown size={9} />
            </button>
            {!isMobile && (
              <span className="hidden items-center gap-1 text-[0.72rem] text-[color:var(--ink-4)] xl:flex">
                <kbd className="app-kbd">Cmd</kbd>
                <kbd className="app-kbd">Enter</kbd>
                to send
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={`pill h-10 shrink-0 px-5 ${
              submitDisabled ? 'cursor-not-allowed border-white/[0.06] bg-white/[0.06] text-[color:var(--ink-4)]' : 'pill-light'
            }`}
          >
            {loading ? (
              <>
                <Spinner size={13} light /> Routing
              </>
            ) : (
              <>
                Execute <Icon.ArrowUpRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      <CommandResults ctx={ctx} />
    </div>
  )
}
