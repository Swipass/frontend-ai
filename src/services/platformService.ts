// src/services/platformService.ts
// The developer dashboard's API client. Every call needs a signed-in session.
import apiClient from './apiClient'

/* ------------------------------------------------------------------ types */

export type ProjectStatus = 'active' | 'paused' | 'suspended'

export interface Project {
  id: string
  name: string
  description?: string | null
  api_key_prefix: string
  status: ProjectStatus | string
  payout_wallet?: string | null
  pending_balance: number
  total_earned: number
  total_volume_usd: number
  created_at: string
  total_transactions?: number
  fee_share_percent?: number | null
  payout_chain?: string
  payout_token?: string
  webhook_configured?: boolean
  last_request_at?: string | null
}

export interface OverviewKpis {
  intents: number
  completed: number
  failed: number
  success_rate: number
  volume_usd: number
  fees_usd: number
  earned_usd: number
  pending_balance_usd?: number
  total_earned_usd?: number
}

export interface OverviewDay {
  date: string
  intents: number
  completed: number
  failed: number
  volume_usd: number
  earned_usd: number
}

export interface OverviewProject {
  id: string
  name: string
  status: string
  intents: number
  volume_usd: number
  earned_usd: number
  last_request_at: string | null
}

export interface RecentIntent {
  id: string
  project_id: string
  project_name: string
  command: string
  from_chain: string
  to_chain: string
  from_token: string
  to_token: string
  volume_usd: number
  status: string
  selected_provider: string | null
  tx_hash: string | null
  created_at: string
}

export interface OnboardingChecklist {
  has_project: boolean
  has_webhook: boolean
  has_payout_wallet: boolean
  first_request: boolean
  first_completed: boolean
}

export interface PlatformNotice {
  paused: boolean
  message: string | null
  api_traffic_paused: boolean
  payouts_frozen: boolean
  developer_fee_percent: number
  revenue_share: number
  minimum_payout_usd: number
}

export interface DeveloperOverview {
  window_days: number
  kpis: OverviewKpis
  previous: Partial<OverviewKpis>
  daily: OverviewDay[]
  projects: OverviewProject[]
  recent_intents: RecentIntent[]
  checklist: OnboardingChecklist
  platform: PlatformNotice
}

export interface UsageDay {
  date: string
  requests: number
  completed: number
  failed: number
  volume_usd: number
  fees_usd: number
  /** 0..100, and 0 on a day with no requests. */
  success_rate: number
}

export interface ProjectUsage {
  total_requests: number
  total_volume_usd: number
  total_fees_usd: number
  period_days: number
  daily?: UsageDay[]
  by_provider?: { provider: string; requests: number; volume_usd: number }[]
  by_route?: { from_chain: string; to_chain: string; requests: number; volume_usd: number }[]
  by_token?: { token: string; requests: number; volume_usd: number }[]
  by_status?: Record<string, number>
}

export interface ProjectIntent {
  id: string
  command: string
  from_chain: string
  to_chain: string
  from_token: string
  to_token: string
  from_amount: string | null
  to_amount: string | null
  volume_usd: number | null
  fee_usd: number | null
  status: string
  selected_provider: string | null
  wallet_address: string | null
  destination_address: string | null
  tx_hash: string | null
  error_message: string | null
  created_at: string
}

export interface IntentPage {
  intents: ProjectIntent[]
  total: number
}

export interface IntentQuery {
  limit?: number
  offset?: number
  status?: string
  q?: string
}

export interface Payout {
  id: string
  project_id: string
  project_name: string
  amount: number
  wallet_address: string
  status: string
  tx_hash: string | null
  notes: string | null
  created_at: string
  completed_at: string | null
}

export interface WebhookTestResult {
  delivered: boolean
  status: number | null
  error: string | null
}

export interface TraceStage {
  stage: string
  status: string
  detail: Record<string, unknown>
  duration_ms: number | null
  created_at: string | null
}

export interface IntentTrace {
  trace_id: string
  intent_id: string
  command: string | null
  wallet_address: string | null
  from_chain: string | null
  to_chain: string | null
  from_token: string | null
  to_token: string | null
  selected_provider: string | null
  quoted_to_amount: string | null
  actual_to_amount: string | null
  truth_return_bps: number | null
  status: string
  tx_hash: string | null
  created_at: string | null
  stages: TraceStage[]
  total_duration_ms: number
}

function query(params: object): string {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

/* ----------------------------------------------------------------- client */

export const platformService = {
  async getMe() {
    const res = await apiClient.get('/platform/me')
    return res.data
  },
  // Everything the overview needs in one call: KPIs against the previous
  // window, the daily series, per-project rows, onboarding and platform state.
  async getOverview(days = 30): Promise<DeveloperOverview> {
    const res = await apiClient.get(`/platform/overview?days=${days}`)
    return res.data
  },
  async listProjects(): Promise<Project[]> {
    const res = await apiClient.get('/platform/projects')
    return res.data
  },
  async createProject(name: string, description?: string) {
    const res = await apiClient.post('/platform/projects', { name, description })
    return res.data
  },
  async deleteProject(id: string) {
    await apiClient.delete(`/platform/projects/${id}`)
  },
  async updateProject(id: string, data: any) {
    const res = await apiClient.patch(`/platform/projects/${id}`, data)
    return res.data
  },
  // Pause or resume a project you own. A suspended project is an admin
  // decision and answers 403.
  async setProjectStatus(id: string, status: 'active' | 'paused'): Promise<Project> {
    const res = await apiClient.put(`/platform/projects/${id}/status`, { status })
    return res.data
  },
  async regenerateKey(id: string) {
    const res = await apiClient.post(`/platform/projects/${id}/regenerate-key`)
    return res.data
  },
  async getUsage(id: string, days = 30): Promise<ProjectUsage> {
    const res = await apiClient.get(`/platform/projects/${id}/usage?days=${days}`)
    return res.data
  },
  // Every request a project sent, newest first, with its outcome.
  async listProjectIntents(id: string, params: IntentQuery = {}): Promise<IntentPage> {
    const res = await apiClient.get(`/platform/projects/${id}/intents${query(params)}`)
    return res.data
  },
  async requestPayout(id: string) {
    const res = await apiClient.post(`/platform/projects/${id}/payout`)
    return res.data
  },
  async listPayouts(projectId?: string): Promise<Payout[]> {
    const res = await apiClient.get(`/platform/payouts${query({ project_id: projectId })}`)
    return res.data?.payouts || []
  },
  async updateFeeShare(
    id: string,
    data: { fee_share_percent?: number; payout_token?: string; payout_chain?: string; payout_wallet?: string }
  ) {
    const res = await apiClient.put(`/platform/projects/${id}/fee-share`, data)
    return res.data
  },
  async getAnalytics() {
    const res = await apiClient.get('/platform/analytics')
    return res.data
  },
  // Webhooks: where we push this project's intent lifecycle events.
  async getWebhook(id: string) {
    const res = await apiClient.get(`/platform/projects/${id}/webhook`)
    return res.data
  },
  async setWebhook(id: string, webhookUrl: string | null) {
    const res = await apiClient.put(`/platform/projects/${id}/webhook`, { webhook_url: webhookUrl })
    return res.data
  },
  async rotateWebhookSecret(id: string) {
    const res = await apiClient.post(`/platform/projects/${id}/webhook/rotate-secret`)
    return res.data
  },
  // Sends a real signed `ping` to the endpoint and reports what it answered.
  async testWebhook(id: string): Promise<WebhookTestResult> {
    const res = await apiClient.post(`/platform/projects/${id}/webhook/test`)
    return res.data
  },
  async listWebhookDeliveries(id: string, limit = 50) {
    const res = await apiClient.get(`/platform/projects/${id}/webhook/deliveries?limit=${limit}`)
    return res.data
  },
  // Traces: the stage-by-stage record of this project's intents. A trace id is
  // the intent id.
  async listProjectTraces(id: string, limit = 50, offset = 0) {
    const res = await apiClient.get(`/platform/projects/${id}/traces?limit=${limit}&offset=${offset}`)
    return res.data
  },
  async getProjectTrace(id: string, traceId: string): Promise<IntentTrace> {
    const res = await apiClient.get(`/platform/projects/${id}/traces/${traceId}`)
    return res.data
  },
}

// The admin client lives in its own module; re-exported so existing imports keep working.
export { adminService } from './adminService'
