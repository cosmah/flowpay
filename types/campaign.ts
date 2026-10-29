export type CampaignStatus = "draft" | "in_review" | "approved" | "changes_requested"

/** Manual campaign post: title, content to publish, channels, optional banners. */
export interface CampaignBrief {
  title: string
  content: string
  channels: string[]
  deadline?: string
  imageUrls: string[]
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
