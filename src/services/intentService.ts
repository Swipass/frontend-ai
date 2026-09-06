// src/services/intentService.ts
import apiClient from './apiClient'

export interface IntentRequest {
  command: string
  destination_address?: string
  wallet_address?: string
  from_chain_hint?: string
}

export interface QuoteResponse {
  provider: string
  from_chain: string
  to_chain: string
  from_token: string
  to_token: string
  from_amount: string
  to_amount: string
  guaranteed_to_amount: string
  fee_amount: string
  fee_token: string
  estimated_time_seconds: number
  estimated_gas_usd: string
  price_impact_percent: string
  route_description?: string
  score: number
  quote_id: string
  expires_at?: number
}

export interface TransactionPayload {
  to: string
  data: string
  value: string
  gas_limit: string
  chain_id: number
  chain_name: string
  max_fee_per_gas?: string
  max_priority_fee_per_gas?: string
  // Allowance target for the input token when the route pulls an ERC20.
  spender?: string
}

// The ERC20 approval the wallet must sign before the swap can execute. Present
// only when the backend read the real on-chain allowance and found it short.
export interface ApprovalPayload {
  to: string
  data: string
  value: string
  gas_limit: string
  chain_id: number
  chain_name: string
  token_symbol: string
  token_address: string
  spender: string
  amount: string
  current_allowance: string
  is_reset: boolean
}

// What the backend returns when building a transaction for one quote: the whole
// sequence to sign, not just the half that would revert without an allowance.
export interface BuildTransactionResponse {
  transaction: TransactionPayload
  approval?: ApprovalPayload | null
  requires_approval: boolean
  simulation_passed: boolean
  simulation_reason: string
}

export interface IntentResponse {
  intent_id: string
  trace_id?: string
  parsed_intent: any
  selected_provider: string
  quote: QuoteResponse
  transaction: TransactionPayload
  all_quotes: QuoteResponse[]
  destination_address?: string
  destination_note: string
  simulation_passed: boolean
  simulation_reason?: string
  approval?: ApprovalPayload | null
  requires_approval?: boolean
}

export interface SystemStats {
  total_transactions: number
  total_volume_usd: number
  total_chains_supported: number
  active_providers: number
  active_projects: number
  total_developers: number
  fee_rate_direct?: string
  fee_rate_developer?: string
  revenue_share?: string
}

export interface ChainInfo {
  key: string
  name: string
  chain_id: number
  native_symbol: string
  native_decimals: number
  explorer: string
  // A public RPC the wallet can use for this chain, so the frontend keeps no
  // chain table of its own.
  rpc_url: string
}

export interface TokenInfo {
  symbol: string
  address: string
  decimals: number
  native: boolean
}

export interface TokenPage {
  chain: string
  tokens: TokenInfo[]
  count: number
  // How many tokens the chain has in total, before the page limit.
  total: number
}

export interface ProviderInfo {
  name: string
  display_name: string
  supported_chains: string[]
  version: string
}

export interface ProviderRating {
  provider: string
  rating: number
  success_rate?: number
  avg_truth_return_bps?: number
  count?: number
}

export const intentService = {
  async execute(req: IntentRequest, headers?: Record<string, string>): Promise<IntentResponse> {
    const res = await apiClient.post('/v1/intent', req, { headers })
    return res.data
  },

  // Returns the transaction plus any approval that must be signed first.
  async buildTransaction(
    quote: QuoteResponse,
    walletAddress: string,
    destinationAddress?: string
  ): Promise<BuildTransactionResponse> {
    const headers: Record<string, string> = { 'X-Wallet-Address': walletAddress }
    if (destinationAddress) headers['X-Destination-Address'] = destinationAddress
    const res = await apiClient.post('/v1/intent/build-transaction', quote, { headers })
    return res.data
  },

  async getStats(): Promise<SystemStats> {
    const res = await apiClient.get('/v1/stats')
    return res.data
  },

  // Provider-derived chain list (single source of truth: id, name, explorer).
  async getChains(): Promise<ChainInfo[]> {
    const res = await apiClient.get('/v1/chains')
    return res.data.chains
  },

  // Provider-derived tokens for a chain (native + resolvable ERC20s). `q`
  // filters by symbol, because a chain carries hundreds to thousands of tokens
  // and a picker needs a search rather than the whole list.
  async getTokens(chain: string, q?: string, limit = 50): Promise<TokenPage> {
    const params = new URLSearchParams({ chain, limit: String(limit) })
    if (q) params.set('q', q)
    const res = await apiClient.get(`/v1/tokens?${params}`)
    return res.data
  },

  async getProviders(): Promise<ProviderInfo[]> {
    const res = await apiClient.get('/v1/providers')
    return res.data.providers
  },

  async getProviderRatings(): Promise<ProviderRating[]> {
    const res = await apiClient.get('/v1/analytics/providers')
    return res.data.providers || []
  },

  // The connected wallet's real transaction history (from the backend).
  async getTransactions(wallet: string, limit = 25): Promise<any[]> {
    const res = await apiClient.get(`/v1/transactions?wallet=${wallet}&limit=${limit}`)
    return res.data.transactions || []
  },

  // Reconciliation hook: called after the wallet signs and the tx settles, so
  // the analytics engine can compute truth-return (actual vs quoted).
  async reportStatus(
    intentId: string,
    txHash: string,
    status: 'completed' | 'failed',
    actualToAmount?: string
  ): Promise<void> {
    await apiClient.post(`/v1/intents/${intentId}/status`, {
      tx_hash: txHash,
      status,
      actual_to_amount: actualToAmount,
    })
  },
}
