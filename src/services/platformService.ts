// src/services/platformService.ts
import apiClient from './apiClient'

export const platformService = {
  async getMe() {
    const res = await apiClient.get('/platform/me')
    return res.data
  },
  async listProjects() {
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
  async regenerateKey(id: string) {
    const res = await apiClient.post(`/platform/projects/${id}/regenerate-key`)
    return res.data
  },
  async getUsage(id: string, days = 30) {
    const res = await apiClient.get(`/platform/projects/${id}/usage?days=${days}`)
    return res.data
  },
  async requestPayout(id: string) {
    const res = await apiClient.post(`/platform/projects/${id}/payout`)
    return res.data
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
  async listWebhookDeliveries(id: string, limit = 50) {
    const res = await apiClient.get(`/platform/projects/${id}/webhook/deliveries?limit=${limit}`)
    return res.data
  },
  // Traces: the stage-by-stage record of this project's intents.
  async listProjectTraces(id: string, limit = 50, offset = 0) {
    const res = await apiClient.get(`/platform/projects/${id}/traces?limit=${limit}&offset=${offset}`)
    return res.data
  },
  async getProjectTrace(id: string, traceId: string) {
    const res = await apiClient.get(`/platform/projects/${id}/traces/${traceId}`)
    return res.data
  },
}

// src/services/adminService.ts
export const adminService = {
  async getOverview() {
    const res = await apiClient.get('/admin/overview')
    return res.data
  },
  async listTransactions(limit = 50, offset = 0, status?: string) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (status) params.append('status', status)
    const res = await apiClient.get(`/admin/transactions?${params}`)
    return res.data
  },
  async listUsers(limit = 100) {
    const res = await apiClient.get(`/admin/users?limit=${limit}`)
    return res.data
  },
  async updateUserRole(userId: string, role: string | null) {
    const res = await apiClient.put(`/admin/users/${userId}/role`, { role })
    return res.data
  },
  async listProjects(limit = 100, status?: string) {
    const params = new URLSearchParams({ limit: String(limit) })
    if (status) params.append('status', status)
    const res = await apiClient.get(`/admin/projects?${params}`)
    return res.data
  },
  async pauseProject(id: string, paused: boolean) {
    const res = await apiClient.post(`/admin/projects/${id}/pause?paused=${paused}`)
    return res.data
  },
  async listProviders() {
    const res = await apiClient.get('/admin/providers')
    return res.data
  },
  async listLiveProviders() {
    const res = await apiClient.get('/admin/providers/live')
    return res.data
  },
  async toggleProvider(name: string, isActive: boolean) {
    const res = await apiClient.post('/admin/providers/toggle', { provider_name: name, is_active: isActive })
    return res.data
  },
  async pauseSystem(paused: boolean) {
    const res = await apiClient.post('/admin/system/pause', { paused })
    return res.data
  },
  async viewAsDeveloper(userId: string) {
    const res = await apiClient.get(`/admin/view-as/developer/${userId}`)
    return res.data
  },
  // Runtime control plane
  async listCredentials() {
    const res = await apiClient.get('/admin/credentials')
    return res.data
  },
  async setCredential(name: string, value: string) {
    const res = await apiClient.put(`/admin/credentials/${name}`, { value })
    return res.data
  },
  async deleteCredential(name: string) {
    const res = await apiClient.delete(`/admin/credentials/${name}`)
    return res.data
  },
  async listChains() {
    const res = await apiClient.get('/admin/chains')
    return res.data
  },
  async setChainActive(key: string, isActive: boolean) {
    const res = await apiClient.post(`/admin/chains/${key}/active`, { is_active: isActive })
    return res.data
  },
  async listBlacklist() {
    const res = await apiClient.get('/admin/blacklist')
    return res.data
  },
  async addBlacklist(address: string, reason?: string) {
    const res = await apiClient.post('/admin/blacklist', { address, reason })
    return res.data
  },
  async removeBlacklist(address: string) {
    const res = await apiClient.delete(`/admin/blacklist/${address}`)
    return res.data
  },
  async setConfig(key: string, value: any) {
    const res = await apiClient.put(`/admin/config/${key}`, { value })
    return res.data
  },
  async listAudit(limit = 100) {
    const res = await apiClient.get(`/admin/audit?limit=${limit}`)
    return res.data
  },
  async getAnalytics() {
    const res = await apiClient.get('/admin/analytics')
    return res.data
  },
  async processPayouts() {
    const res = await apiClient.post('/admin/payouts/process')
    return res.data
  },
  async listPayouts(limit = 50) {
    const res = await apiClient.get(`/admin/payouts/?limit=${limit}`)
    return res.data
  },
  // Runtime tunables: routing weights, slippage cap, quote TTL, fee rates.
  async getTunables() {
    const res = await apiClient.get('/admin/tunables')
    return res.data
  },
  async updateTunables(changes: Record<string, number | boolean>) {
    const res = await apiClient.put('/admin/tunables', changes)
    return res.data
  },
  // Full-trace drill-down.
  async listTraces(params: { limit?: number; offset?: number; status?: string; provider?: string; wallet?: string } = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v))
    })
    const res = await apiClient.get(`/admin/traces?${query}`)
    return res.data
  },
  async getTrace(traceId: string) {
    const res = await apiClient.get(`/admin/traces/${traceId}`)
    return res.data
  },
}
