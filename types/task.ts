export type TaskStatus = "open" | "in_progress" | "done" | "overdue"

export interface Task {
  id: string
  draftId: string
  campaignId: string
  title: string
  ownerRole: "reviewer"
  status: TaskStatus
  dueAt: string
  createdAt: string
}
