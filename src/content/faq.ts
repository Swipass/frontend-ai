// src/content/faq.ts
// Landing page FAQ copy. Kept as data so the FAQ section, the FAQPage
// structured data and the crawler snapshot all read the same source.

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  { q: 'Do I need to create an account?', a: 'No. Anyone can visit Swipass, connect a wallet, and start issuing commands immediately. No email, no sign-up. Only developers and admins need an account.' },
  { q: 'How does Swipass pick the best route?', a: 'All enabled providers are queried simultaneously. Each quote is scored: 70% output amount, 20% speed, 10% historical success rate over the past 30 days.' },
  { q: 'Is my voice data stored?', a: 'Never. Transcription runs in WebAssembly locally in your browser. Only the resulting text command is sent to our servers.' },
  { q: 'What if a provider fails?', a: 'Swipass automatically falls back to the next best provider from the original quote set without interrupting your experience.' },
  { q: 'How do I earn as a developer?', a: 'Integrate the /v1/intent endpoint with your API key. Every transaction your users execute generates 0.075% in fees accumulated in your project balance, withdrawable at $50.' },
  { q: 'Can I bring my own LLM?', a: 'Yes. Pass X-LLM-Provider, X-LLM-API-Key, and X-LLM-Model headers per request. Keys are used only for that session and never stored.' },
  { q: 'Does Swipass hold my funds?', a: 'No. Swipass is fully non-custodial. You always sign transactions from your own wallet. No private keys are ever requested.' },
  { q: 'What is Swipass?', a: 'Swipass is Web3 transaction infrastructure: an AI-powered transaction execution layer that turns a plain-language command into a cross-chain transaction. It parses the intent, routes it across every connected swap and bridge aggregator, and returns one transaction for your wallet to sign.' },
  { q: 'Does Swipass simulate a transaction before I sign it?', a: 'Yes. Every route is pre-flight simulated against live chain state before it is shown as ready to sign. A route whose calldata would revert is skipped and the next-best route is tried, so what you see is a route already known to execute.' },
  { q: 'How does Swipass compare providers?', a: 'Swipass is a swap aggregator and bridge aggregator across 18 providers at once, and it tracks each provider\'s real settled performance over time: quoted output versus what actually landed, in basis points ("truth-return"). That history feeds back into which route is offered, not just the quote each provider\'s API returns.' },
  { q: 'What is a transaction intent API?', a: 'It is a developer API where you send a plain-language or structured intent, natural-language Web3 transactions like "bridge 50 USDC from Arbitrum to Base", and get back ready-to-sign calldata instead of having to integrate each swap or bridge provider yourself. Swipass\'s intent API is one REST endpoint, /v1/intent.' },
]
