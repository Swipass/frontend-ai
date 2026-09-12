// src/content/features.ts
// Landing page capability cards. Kept as data so the section and the crawler
// snapshot read the same source.

export interface Feature {
  title: string
  desc: string
  icon: string
}

export const FEATURES: Feature[] = [
  { title: 'Voice-First Interface', desc: 'Speak or type commands. Vosk transcribes audio locally, so your voice never leaves your device. Intent parsing extracts chain, token, and amount.', icon: '🎤' },
  { title: 'Cross-Chain Execution', desc: 'All major EVM chains via integrated providers. Send to a different address on the destination chain, signed once from your wallet.', icon: '⛓️' },
  { title: 'Intelligent Routing', desc: 'All providers queried concurrently. Weighted scoring on output amount, speed, and historical success rate selects optimal route automatically.', icon: '🎯' },
  { title: 'Developer API', desc: 'REST API for integrating cross-chain execution into any application. Bring your own LLM keys, passing your own OpenAI or Anthropic credentials per request.', icon: '</>' },
  { title: 'Revenue Sharing', desc: 'Earn 50% of every transaction fee your users generate. Withdrawals to any EVM wallet once $50 threshold is reached.', icon: '💰' },
  { title: 'Non-Custodial & Secure', desc: 'Swipass never holds funds. Rate limiting, transaction simulation, and admin circuit breakers protect against abuse. Keys stored hashed.', icon: '🛡️' },
]
