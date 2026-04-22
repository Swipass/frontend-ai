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
}
