// src/services/adminService.ts
// The admin dashboard's API client. Every call needs an admin session.
// A refused call rejects with an Error whose message is the API's own
// explanation, so pages can show it in a toast as it is.
import type { AxiosRequestConfig } from 'axios'
import apiClient from './apiClient'

/* ------------------------------------------------------------------ types */

export type AlertLevel = 'critical' | 'warning' | 'info'

export interface EmergencyState {
  system_paused: boolean
  switches: Record<string, boolean>
  descriptions: Record<string, string>
  max_intent_usd: number | null
  maintenance_message: string | null
  /** Epoch seconds. */
  updated_at: number | null
  updated_by: string | null
}

export interface EmergencyUpdate {
  system_paused?: boolean
  switches?: Record<string, boolean>
  max_intent_usd?: number | null
  maintenance_message?: string | null
  reason: string
}

export interface DashboardKpis {
  intents: number
  completed: number
  failed: number
  success_rate: number
  volume_usd: number
  fees_usd: number
  unique_wallets: number
  active_projects: number
  new_users: number
  pending_payouts_count: number
  pending_payouts_usd: number
}

export interface DashboardDay {
  date: string
  intents: number
  completed: number
  failed: number
  volume_usd: number
  fees_usd: number
}

export interface DashboardAlert {
  level: AlertLevel
  code: string
  title: string
  detail: string
  action_path: string | null
}

export interface RecentIntent {
  id: string
  command: string | null
  from_chain: string | null
  to_chain: string | null
  from_token: string | null
  to_token: string | null
  volume_usd: number
  status: string
  selected_provider: string | null
  created_at: string | null
}

export interface AuditEntry {
  id?: number | string
  actor: string | null
  action: string
  target: string | null
  detail?: unknown
  created_at: string | null
}

export interface AdminDashboardData {
  window_days: number
  status: {
    system_paused: boolean
    emergency_active: string[]
    maintenance_message: string | null
    providers_total: number
    providers_available: number
    providers_active: number
    chains_total: number
    chains_active: number
  }
  kpis: DashboardKpis
  previous: Partial<DashboardKpis>
  daily: DashboardDay[]
  top_providers: { provider: string; intents: number; volume_usd: number }[]
  top_routes: { from_chain: string; to_chain: string; intents: number; volume_usd: number }[]
  top_tokens: { token: string; intents: number; volume_usd: number }[]
  top_projects: { project_id: string; name: string; intents: number; volume_usd: number; fees_usd: number }[]
  recent_intents: RecentIntent[]
  recent_audit: AuditEntry[]
  alerts: DashboardAlert[]
}

export interface HealthService {
  name: string
  ok: boolean
  latency_ms: number | null
  detail: string
}

export interface HealthRpc {
  chain: string
  name: string
  configured: boolean
  ok: boolean
  block: number | null
  latency_ms: number | null
  error: string | null
}

export interface HealthProvider {
  name: string
  display_name: string
  kind: string
  available: boolean
  active: boolean
  chains: string[]
}

export interface AdminHealth {
  checked_at: string
  services: HealthService[]
  rpc: HealthRpc[]
  providers: HealthProvider[]
  token_lists: { chain: string; loaded: boolean; count: number }[]
}

export interface ProviderStats30d {
  intents_30d: number
  volume_usd_30d: number
  success_rate: number | null
  avg_truth_return_bps: number | null
}

export interface LiveProvider {
  name: string
  display_name: string
  kind: string
  available: boolean
  supported_chains: string[]
  active?: boolean
  stats?: ProviderStats30d
}

export interface ProbeResult {
  provider: string
  ok: boolean
  latency_ms: number
  route: string
  to_amount: string | null
  guaranteed_to_amount: string | null
  error: string | null
  available: boolean
}

export interface AdminUser {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role: string | null
  is_active?: boolean
  email_verified?: boolean
  auth_method?: 'email' | 'google' | 'github' | 'seed' | 'other'
  projects?: number
  created_at: string | null
}

export type ProjectStatus = 'active' | 'paused' | 'suspended'

export interface AdminProject {
  id: string
  name: string
  description?: string | null
  status: string
  user_id: string
  owner_email?: string | null
  api_key_prefix?: string | null
  pending_balance: number
  total_earned: number
  total_volume_usd: number
  total_transactions?: number
  fee_share_percent?: number | null
  payout_wallet?: string | null
  payout_chain?: string | null
  payout_token?: string | null
  webhook_configured?: boolean
  last_request_at?: string | null
  created_at: string | null
}

export interface AdminTransaction {
  id: string
  command: string | null
  from_chain: string | null
  to_chain: string | null
  from_token: string | null
  to_token?: string | null
  from_amount?: string | number | null
  to_amount?: string | number | null
  volume_usd: number
  fee_usd: number
  status: string
  selected_provider: string | null
  project_id: string | null
  project_name?: string | null
  wallet_address?: string | null
  destination_address?: string | null
  tx_hash?: string | null
  error_message?: string | null
  created_at: string | null
}

export interface TransactionQuery {
  limit?: number
  offset?: number
  status?: string
  provider?: string
  chain?: string
  project_id?: string
  q?: string
  /** ISO 8601. */
  since?: string
}

export interface AdminFinance {
  fees_accounted_usd: number
  fees_window_usd: number
  window_days: number
  developer_share_owed_usd: number
  paid_out_usd: number
  pending_payouts: { count: number; amount_usd: number }
  treasury: { configured: boolean; address: string | null }
  fee_recipient: { address: string | null; valid: boolean }
  payouts_frozen: boolean
  minimum_payout_usd: number
}

export interface AdminPayout {
  id: string
  project_id: string
  project_name?: string | null
  owner_email?: string | null
  amount: number
  wallet_address: string
  status: string
  tx_hash: string | null
  notes: string | null
  created_at: string | null
  completed_at: string | null
}

export interface PayoutRunSummary {
  total: number
  completed: number
  failed: number
  skipped_no_treasury: number
  errors: { payout_id: string; error: string }[]
}

export interface ManagedCredential {
  name: string
  is_set: boolean
  masked: string
  source: 'db' | 'env' | 'unset' | string
  updated_at: string | null
  group?: 'providers' | 'llm' | 'oauth' | 'fees' | 'data' | string
  label?: string
}

export interface ProviderStat {
  provider: string
  count: number
  success_count: number
  success_rate: number
  avg_execution_time_ms: number | null
  avg_truth_return_bps: number
  truth_samples: number
  window_days: number
}

export interface AdminAnalytics {
  window_days: number
  totals: {
    total_intents: number
    completed: number
    failed: number
    success_rate: number
    total_volume_usd: number
    total_fees_usd: number
    reconciled_intents: number
  }
  per_provider?: ProviderStat[]
  provider_stats?: ProviderStat[]
  per_chain?: { from_chain: string; to_chain: string; count: number; volume_usd: number }[]
}

/* ---------------------------------------------------------------- transport */

const ERROR_TEXT: Record<string, string> = {
  payouts_frozen: 'Payouts are frozen. Turn the switch off on the Emergency page to send them.',
}

/** The API's explanation for a refused call, whatever shape `detail` takes. */
function readable(data: any, status: number): string {
  const detail = data?.detail ?? data
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const msgs = detail.map((d: any) => d?.msg).filter(Boolean)
    if (msgs.length) return msgs.join('. ')
  }
  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string' && detail.message) return detail.message
    if (typeof detail.error === 'string') return ERROR_TEXT[detail.error] || detail.error.replace(/_/g, ' ')
  }
  return `Request failed (${status})`
}

// 4xx answers resolve here (except 401, which the shared client turns into a
// sign-out) so their `detail` reaches the page as a readable message.
async function send<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.request({
    ...config,
    validateStatus: s => (s >= 200 && s < 300) || (s >= 400 && s < 500 && s !== 401),
  })
  if (res.status >= 400) throw new Error(readable(res.data, res.status))
  return res.data as T
}

function get<T = any>(url: string) {
  return send<T>({ method: 'get', url })
}

function post<T = any>(url: string, data?: unknown) {
  return send<T>({ method: 'post', url, data })
}

function put<T = any>(url: string, data?: unknown) {
  return send<T>({ method: 'put', url, data })
}

function del<T = any>(url: string) {
  return send<T>({ method: 'delete', url })
}

/** "?a=1&b=x" from the set values, or "" when none are set. */
function query(params: Record<string, string | number | boolean | null | undefined>): string {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

/* ------------------------------------------------------------------ client */

export const adminService = {
  // Command center and platform state
  async getOverview() {
    return get('/admin/overview')
  },
  async getDashboard(days = 30) {
    return get<AdminDashboardData>(`/admin/dashboard${query({ days })}`)
  },
  async getHealth() {
    return get<AdminHealth>('/admin/health')
  },

  // Emergency switches
  async getEmergency() {
    return get<EmergencyState>('/admin/emergency')
  },
  async updateEmergency(body: EmergencyUpdate) {
    return put<EmergencyState>('/admin/emergency', body)
  },
  async signOutEveryone(reason: string) {
    return post<{ signed_out: number }>('/admin/emergency/sign-out-all', { reason })
  },
  async pauseSystem(paused: boolean) {
    return post('/admin/system/pause', { paused })
  },

  // Transactions
  async listTransactions(limit = 50, offset = 0, status?: string) {
    return get(`/admin/transactions${query({ limit, offset, status })}`)
  },
  async searchTransactions(params: TransactionQuery = {}) {
    return get<{ transactions: AdminTransaction[]; total: number }>(`/admin/transactions${query({ ...params })}`)
  },

  // Users
  async listUsers(limit = 100) {
    return get(`/admin/users${query({ limit })}`)
  },
  async searchUsers(params: { limit?: number; offset?: number; q?: string; role?: string; status?: string } = {}) {
    return get<{ users: AdminUser[]; total: number }>(`/admin/users${query(params)}`)
  },
  async updateUserRole(userId: string, role: string | null) {
    return put(`/admin/users/${userId}/role`, { role })
  },
  async setUserActive(userId: string, isActive: boolean, reason: string) {
    return put<AdminUser>(`/admin/users/${userId}/active`, { is_active: isActive, reason })
  },
  async signOutUser(userId: string) {
    return post<{ id: string; signed_out: boolean }>(`/admin/users/${userId}/sign-out`)
  },
  async viewAsDeveloper(userId: string) {
    return get(`/admin/view-as/developer/${userId}`)
  },

  // Projects
  async listProjects(limit = 100, status?: string) {
    return get(`/admin/projects${query({ limit, status })}`)
  },
  async searchProjects(params: { limit?: number; offset?: number; q?: string; status?: string } = {}) {
    return get<{ projects: AdminProject[]; total: number }>(`/admin/projects${query(params)}`)
  },
  async pauseProject(id: string, paused: boolean) {
    return post(`/admin/projects/${id}/pause${query({ paused })}`)
  },
  async setProjectStatus(id: string, status: ProjectStatus, reason: string) {
    return put<AdminProject>(`/admin/projects/${id}/status`, { status, reason })
  },
  async setProjectFeeShare(id: string, feeSharePercent: number | null, reason: string) {
    return put<AdminProject>(`/admin/projects/${id}/fee-share`, { fee_share_percent: feeSharePercent, reason })
  },

  // Providers
  async listProviders() {
    return get('/admin/providers')
  },
  async listLiveProviders() {
    return get<{ providers: LiveProvider[] }>('/admin/providers/live')
  },
  async toggleProvider(name: string, isActive: boolean) {
    return post('/admin/providers/toggle', { provider_name: name, is_active: isActive })
  },
  async probeProvider(name: string) {
    // The probe waits up to 12 s on the provider; leave room above that.
    return send<ProbeResult>({ method: 'post', url: `/admin/providers/${name}/probe`, timeout: 20000 })
  },

  // Runtime control plane
  async listCredentials() {
    return get<{ credentials: ManagedCredential[] }>('/admin/credentials')
  },
  async setCredential(name: string, value: string) {
    return put(`/admin/credentials/${name}`, { value })
  },
  async deleteCredential(name: string) {
    return del(`/admin/credentials/${name}`)
  },
  async listChains() {
    return get('/admin/chains')
  },
  async setChainActive(key: string, isActive: boolean) {
    return post(`/admin/chains/${key}/active`, { is_active: isActive })
  },
  async listBlacklist() {
    return get('/admin/blacklist')
  },
  async addBlacklist(address: string, reason?: string) {
    return post('/admin/blacklist', { address, reason })
  },
  async removeBlacklist(address: string) {
    return del(`/admin/blacklist/${address}`)
  },
  async setConfig(key: string, value: any) {
    return put(`/admin/config/${key}`, { value })
  },

  // Audit
  async listAudit(limit = 100) {
    return get(`/admin/audit${query({ limit })}`)
  },
  async searchAudit(params: { limit?: number; offset?: number; actor?: string; action?: string } = {}) {
    return get<{ audit: AuditEntry[]; total: number }>(`/admin/audit${query(params)}`)
  },

  // Analytics
  async getAnalytics() {
    return get<AdminAnalytics>('/admin/analytics')
  },

  // Finance and payouts
  async getFinance(days = 30) {
    return get<AdminFinance>(`/admin/finance${query({ days })}`)
  },
  async processPayouts() {
    return post<PayoutRunSummary>('/admin/payouts/process')
  },
  async listPayouts(limit = 50, status?: string) {
    return get<AdminPayout[]>(`/admin/payouts/${query({ limit, status })}`)
  },
  async rejectPayout(id: string, reason: string) {
    return post<AdminPayout>(`/admin/payouts/${id}/reject`, { reason })
  },

  // Runtime tunables: routing weights, slippage cap, quote TTL, fee rates.
  async getTunables() {
    return get('/admin/tunables')
  },
  async updateTunables(changes: Record<string, number | boolean>) {
    return put('/admin/tunables', changes)
  },

  // Full-trace drill-down.
  async listTraces(params: { limit?: number; offset?: number; status?: string; provider?: string; wallet?: string } = {}) {
    return get(`/admin/traces${query(params)}`)
  },
  async getTrace(traceId: string) {
    return get(`/admin/traces/${traceId}`)
  },
}
