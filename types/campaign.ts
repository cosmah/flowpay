export type CampaignStatus = "draft" | "in_review" | "approved" | "changes_requested"

export interface CampaignBrief {
  title: string
  objective: string
  audience: string
  tone: string
  keyMessage: string
  channels: string[]
  deadline?: string
}

export interface Campaign {
  id: string
  brief: CampaignBrief
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}
