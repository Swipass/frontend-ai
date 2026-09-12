// src/content/features.ts
// Landing page capabilities, presented as "elements". Kept as data so the
// section and the crawler snapshot read the same source.

export interface Feature {
  /** Two-letter element symbol shown large on the card. */
  symbol: string
  /** Element name shown in brackets beside the symbol. */
  name: string
  title: string
  desc: string
  audience: string
  href: string
}

export const FEATURES: Feature[] = [
  { symbol: 'Vo', name: 'Voice', title: 'Voice-First Interface', desc: 'Speak or type commands. Vosk transcribes audio locally, so your voice never leaves your device. Intent parsing extracts chain, token, and amount.', audience: 'For everyone', href: '/app' },
  { symbol: 'Xc', name: 'Cross-chain', title: 'Cross-Chain Execution', desc: 'All major EVM chains via integrated providers. Send to a different address on the destination chain, signed once from your wallet.', audience: 'Every major EVM chain', href: '/app' },
  { symbol: 'Rt', name: 'Routing', title: 'Intelligent Routing', desc: 'All providers queried concurrently. Weighted scoring on output amount, speed, and historical success rate selects optimal route automatically.', audience: 'Scored on every request', href: '/#providers' },
  { symbol: 'Ap', name: 'API', title: 'Developer API', desc: 'REST API for integrating cross-chain execution into any application. Bring your own LLM keys, passing your own OpenAI or Anthropic credentials per request.', audience: 'For developers', href: '/docs' },
  { symbol: 'Rv', name: 'Revenue', title: 'Revenue Sharing', desc: 'Earn 50% of every transaction fee your users generate. Withdrawals to any EVM wallet once $50 threshold is reached.', audience: 'For builders', href: '/#developers' },
  { symbol: 'Nc', name: 'Non-custodial', title: 'Non-Custodial & Secure', desc: 'Swipass never holds funds. Rate limiting, transaction simulation, and admin circuit breakers protect against abuse. Keys stored hashed.', audience: 'Your keys stay yours', href: '/#security' },
]
