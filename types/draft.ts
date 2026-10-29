export type DraftFormat = "caption" | "email" | "visual"
export type DraftStatus = "draft" | "in_review" | "approved" | "changes_requested"

export interface Draft {
  id: string
  campaignId: string
  format: DraftFormat
  content: string
  status: DraftStatus
  generationSource: "ai" | "template"
  reviewComments: ReviewComment[]
  createdAt: string
  updatedAt: string
}

export interface ReviewComment {
  id: string
  authorRole: "marketer" | "reviewer"
  body: string
  createdAt: string
}
