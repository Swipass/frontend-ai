// src/components/landing/DeveloperSection.tsx
import { Link } from 'react-router-dom'

export function DeveloperSection() {
  return (
    <section id="developers" className="py-16 md:py-28 px-6 border-t border-dark-grey-3 relative z-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="section-label reveal mb-6">Developer Platform</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-almost-white leading-tight reveal reveal-delay-1">
            Build with intent.<br /><span className="font-serif italic font-normal text-light-grey-2">Earn on every swap.</span>
          </h2>
          <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed my-6 reveal reveal-delay-2">Integrate Swipass with a single REST endpoint. Bring your own LLM keys. Every transaction your users execute generates revenue for you.</p>
          <div className="flex gap-4 reveal reveal-delay-3">
            <Link to="/docs" className="sw-btn sw-btn-primary">View Docs</Link>
            <Link to="/auth" className="sw-btn sw-btn-ghost">Sign Up Free</Link>
          </div>
        </div>
        <div className="reveal reveal-delay-2">
          <div className="border border-dark-grey-3 rounded-xl overflow-hidden bg-dark-grey-1">
            <div className="px-4 py-3 border-b border-dark-grey-3 text-xs uppercase tracking-wide text-light-grey-1">Fee & Revenue Structure</div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-light-grey-1 border-b border-dark-grey-3">
                  <th className="p-4 font-normal">User Type</th><th className="p-4 font-normal">Fee</th><th className="p-4 font-normal">Your Share</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dark-grey-2"><td className="p-4 text-sm text-light-grey-3">Direct User</td><td className="p-4 text-sm text-light-grey-3">0.10%</td><td className="p-4 text-sm text-light-grey-3">—</td></tr>
                <tr><td className="p-4 text-sm text-almost-white font-medium">Via Developer App</td><td className="p-4 text-sm text-almost-white">0.15%</td><td className="p-4 text-sm text-almost-white font-semibold">0.075% (50%)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 border border-dark-grey-3 rounded-xl overflow-hidden bg-dark-grey-1">
            <div className="px-4 py-3 border-b border-dark-grey-3 text-xs uppercase tracking-wide text-light-grey-1">Quick Integration</div>
            <pre className="p-4 font-mono text-xs text-light-grey-2 leading-relaxed bg-deepest-dark overflow-auto">
{`POST /v1/intent
Headers:
  X-API-Key: sw_live_...
  X-LLM-Provider: openai   # optional
  X-LLM-API-Key: sk-...    # optional
Body:
{
  "command": "Bridge 1 ETH to Polygon",
  "destination_address": "0x..."
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}