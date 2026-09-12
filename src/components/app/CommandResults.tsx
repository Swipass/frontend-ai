// src/components/app/CommandResults.tsx
// Everything the command card shows below the input box: loading state, the
// provider quote list, the mobile confirm button, quick commands, and the
// long-pending warning.
import { IntentExecution } from './useIntentExecution'
import { ProviderTable } from './ProviderTable'
import { ConfirmButton } from './ConfirmButton'
import { Icon } from './shared'

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
    approval,
    pendingWarning,
    txHash,
    isMobile,
    quickCommands,
  } = ctx

  return (
    <>
      {loading && (
        <div className="app-rise flex flex-col items-center gap-3 py-8 text-center">
          <div className="relative mb-1 h-14 w-14" aria-hidden="true">
            <div className="app-ring absolute inset-0 rounded-full border border-white/10 border-t-white/80" />
            <div className="app-ring-rev absolute inset-2 rounded-full border border-white/10 border-b-white/60" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--ink)] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </div>
          <div className="text-[0.92rem] text-[color:var(--ink-2)]">Reading your command</div>
          <div className="f-mono text-[0.7rem] text-[color:var(--ink-4)]">Asking every provider for a quote at once</div>
        </div>
      )}

      {result && !loading && (
        <div className="app-rise">
          <ProviderTable
            result={result}
            selectedProvider={selectedProvider}
            onSelectProvider={handleSelectProvider}
            ratings={ratings}
          />
        </div>
      )}

      {result && !loading && isMobile && (
        <ConfirmButton
          result={result}
          approval={approval}
          isConfirming={isConfirming}
          isSending={isSending}
          isWaiting={isWaiting}
          onConfirm={handleConfirm}
        />
      )}

      {!loading && !result && quickCommands.length > 0 && (
        <div className="app-rise">
          <div className="kicker mb-3 text-center">Try one of these</div>
          <div className="flex flex-wrap justify-center gap-2">
            {quickCommands.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCommand(c)}
                className="chip group text-left text-[0.8rem] text-[color:var(--ink-3)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-[color:var(--ink)]"
              >
                {c}
                <span className="-ml-1 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100">
                  <Icon.ArrowUpRight size={11} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingWarning && txHash && (
        <div className="app-rise flex items-start gap-2.5 rounded-2xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-[0.8rem] leading-relaxed text-[color:var(--ink-2)]">
          <span className="mt-0.5 shrink-0">
            <Icon.Warning size={14} />
          </span>
          <span>
            Transaction is taking longer than usual. It may be stuck due to network congestion or low gas. You can
            speed up or cancel in your wallet.
          </span>
        </div>
      )}
    </>
  )
}
