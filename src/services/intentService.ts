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
  fee_amount: string
  fee_token: string
  estimated_time_seconds: number
  estimated_gas_usd: string
  score: number
  quote_id: string
}

export interface TransactionPayload {
  to: string
  data: string
  value: string
  gas_limit: string
  chain_id: number
  chain_name: string
}

export interface IntentResponse {
  intent_id: string
  parsed_intent: any
  selected_provider: string
  quote: QuoteResponse
  transaction: TransactionPayload
  all_quotes: QuoteResponse[]
  destination_address?: string
  destination_note: string
}

export interface SystemStats {
  total_transactions: number
  total_volume_usd: number
  total_chains_supported: number
  active_providers: number
  active_projects: number
  total_developers: number
}

export const intentService = {
  async execute(
    req: IntentRequest,
    headers?: Record<string, string>
  ): Promise<IntentResponse> {
    const res = await apiClient.post('/v1/intent', req, { headers })
    return res.data
  },

  async buildTransaction(
    quote: QuoteResponse,
    walletAddress: string
  ): Promise<TransactionPayload> {
    const res = await apiClient.post(
      '/v1/intent/build-transaction',
      quote,
      {
        headers: {
          'X-Wallet-Address': walletAddress,
        },
      }
    )
    return res.data
  },

  async getStats(): Promise<SystemStats> {
    const res = await apiClient.get('/v1/stats')
    return res.data
  },

  async getChains(): Promise<string[]> {
    const res = await apiClient.get('/v1/chains')
    return res.data.chains
  },
}