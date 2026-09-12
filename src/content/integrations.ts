// src/content/integrations.ts
// The third-party services Swipass relies on, grouped by what they do, and the
// disclaimer that applies when you use them. Providers come from the provider
// profiles, so a provider added there appears here too.
import { PROVIDER_PROFILES } from './providers'

export interface Integration {
  name: string
  role: string
  url?: string
}

export interface IntegrationGroup {
  id: string
  title: string
  summary: string
  items: Integration[]
}

// Each provider's own site, for readers who want to look into it.
const PROVIDER_SITES: Record<string, string> = {
  '0x': 'https://0x.org',
  '1inch': 'https://1inch.io',
  uniswap: 'https://uniswap.org',
  kyberswap: 'https://kyberswap.com',
  paraswap: 'https://www.velora.xyz',
  openocean: 'https://openocean.finance',
  okx: 'https://web3.okx.com',
  lifi: 'https://li.fi',
  socket: 'https://www.bungee.exchange',
  relay: 'https://relay.link',
  across: 'https://across.to',
  stargate: 'https://stargate.finance',
  debridge: 'https://debridge.com',
  symbiosis: 'https://symbiosis.finance',
  near_intents: 'https://near-intents.org',
  mayan: 'https://mayan.finance',
  rango: 'https://rango.exchange',
  squid: 'https://www.squidrouter.com',
}

function providers(sameChain: boolean): Integration[] {
  return PROVIDER_PROFILES.filter((p) => (p.kind === 'Same-chain swaps') === sameChain).map((p) => ({
    name: p.displayName,
    role: p.summary,
    url: PROVIDER_SITES[p.name],
  }))
}

export const INTEGRATION_GROUPS: IntegrationGroup[] = [
  {
    id: 'swaps',
    title: 'Same-chain swaps',
    summary: 'DEX aggregators and pools that quote and settle a swap within one chain.',
    items: providers(true),
  },
  {
    id: 'cross-chain',
    title: 'Cross-chain swaps and bridging',
    summary: 'Bridges, solver networks and aggregators that move value between chains, with a swap on either side where needed.',
    items: providers(false),
  },
  {
    id: 'prices',
    title: 'Prices and market data',
    summary: 'Public price data used to value trades and to compare each route with the exchange price.',
    items: [
      { name: 'Binance, Coinbase, OKX, Kraken and Bybit', role: 'Public order book prices, used only to compare each route with the exchange price. Nothing trades on an exchange.' },
      { name: 'CoinGecko', role: 'US dollar values for trade volume and fee accounting.', url: 'https://www.coingecko.com' },
    ],
  },
  {
    id: 'security',
    title: 'Token security',
    summary: 'Checks on the token you are about to receive.',
    items: [
      { name: 'GoPlus Security', role: 'Looks for known scam patterns in the contract of the token you are buying, such as a token that cannot be sold. Any flag is shown to you as a warning before you sign.', url: 'https://gopluslabs.io' },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Wallets and infrastructure',
    summary: 'The services that connect your wallet, read the chain and understand your command.',
    items: [
      { name: 'WalletConnect (Reown)', role: 'Connects your wallet to the app. Every transaction is signed in your wallet.', url: 'https://reown.com' },
      { name: 'Alchemy', role: 'Reads chain state and simulates each transaction before you sign it.', url: 'https://www.alchemy.com' },
      { name: 'Language model provider', role: 'Turns the text of your command into a structured intent. Developers can use their own provider through the API.' },
    ],
  },
]

export const DISCLAIMER_UPDATED = '12 September 2026'

// "We" is Swipass; "you" is anyone who uses Swipass, directly or through an
// app built on its API.
export const DISCLAIMER: string[] = [
  'Swipass is a non-custodial interface. It finds routes offered by the third-party protocols and services listed on this page and prepares a transaction for you to sign in your own wallet. We never hold your funds, and a transaction only happens when you sign it.',
  'Choosing to use a route, and the third party behind it, is your decision. We do not operate, control or audit these third parties, and we make no promise about the accuracy, completeness, reliability, availability or timeliness of their services or of the information they provide, including quotes, prices, exchange price comparisons and token security flags.',
  'Quotes can change before a transaction settles. The guaranteed minimum shown with a route is the floor its contract enforces, not a promise from us. A missing security warning does not mean a token is safe, and a warning does not mean it is unsafe.',
  'You are solely responsible for the outcome of any transaction you sign and for deciding whether using a third-party service is lawful where you live. We do not give legal, financial or tax advice, and we recommend that you follow the laws and regulations of your jurisdiction.',
  'Any loss, claim or dispute that arises from your use of a third-party service, including contract, legal and financial matters, is between you and that third party. We are not responsible for resolving it.',
  'To quote and carry out a request, we share with third parties only what they need: typically your wallet address, the destination address, the tokens, chains and amount, and, for command parsing, the text of your command. We do not share anything else without your consent.',
  'Swipass may earn a platform fee on a route, collected through the provider that carries it. The fee is included in the quote you see before you sign.',
  'Listing a third party on this page, or offering one of its routes, is not a recommendation, endorsement or advice to use that third party or its services.',
]
