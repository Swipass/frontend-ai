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
]
