import type { CampaignStatus, DraftStatus, TaskStatus } from "@/types"

export const DRAFT_STATUS_LABELS: Record<DraftStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  changes_requested: "Changes requested",
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  changes_requested: "Changes requested",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  overdue: "Overdue",
}

/** Review tasks are due 24h after a draft is submitted (demo default). */
export const REVIEW_TASK_DUE_HOURS = 24
