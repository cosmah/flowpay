import type { Campaign, CampaignBrief } from "@/types"
import { api } from "./client"

export const campaignsApi = {
  list: () => api.get<Campaign[]>("/campaigns"),
  get: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
  create: (brief: CampaignBrief) => api.post<Campaign>("/campaigns", brief),
  update: (id: string, brief: Partial<CampaignBrief>) =>
    api.patch<Campaign>(`/campaigns/${id}`, brief),
}
