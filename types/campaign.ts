export type CampaignStatus = "draft" | "in_review" | "approved" | "changes_requested"

/**
 * Relworx brief fields (Career Expo challenge):
 * objective, audience, service/product, channel, tone, desired customer action.
 */
export interface CampaignBrief {
  title: string
  objective: string
  audience: string
  productService: string
  tone: string
  customerAction: string
  channels: string[]
  deadline?: string
}

export interface Campaign {
  id: string
  projectId: string
  brief: CampaignBrief
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}
