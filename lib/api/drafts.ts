import type { Draft } from "@/types"
import { api } from "./client"

export const draftsApi = {
  listByCampaign: (campaignId: string) =>
    api.get<Draft[]>(`/campaigns/${campaignId}/drafts`),
  generate: (campaignId: string) =>
    api.post<Draft[]>(`/campaigns/${campaignId}/generate`),
  update: (id: string, content: string) =>
    api.patch<Draft>(`/drafts/${id}`, { content }),
  submit: (id: string) => api.post<Draft>(`/drafts/${id}/submit`),
  approve: (id: string, comment?: string) =>
    api.post<Draft>(`/drafts/${id}/approve`, { comment }),
  requestChanges: (id: string, comment: string) =>
    api.post<Draft>(`/drafts/${id}/request-changes`, { comment }),
}
