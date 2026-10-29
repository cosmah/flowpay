import type { AppNotification } from "@/types"
import { ROUTES } from "@/lib/constants/routes"

export function createSeedNotifications(now = new Date()): AppNotification[] {
  const hour = 60 * 60 * 1000
  return [
    {
      id: "notif_review_queue",
      title: "Draft waiting for review",
      summary: "Summer Launch caption is in the review queue.",
      body: "A marketer submitted a caption draft for Summer Launch 2026. Open the review queue to approve or request changes within 24 hours.",
      kind: "review",
      createdAt: new Date(now.getTime() - hour).toISOString(),
      href: ROUTES.review,
    },
    {
      id: "notif_task_overdue",
      title: "Overdue task reminder",
      summary: "Confirm summer visual assets with brand is past due.",
      body: "This manual task is overdue. Update the status on the Tasks list or Task board once brand confirmation is complete.",
      kind: "task",
      createdAt: new Date(now.getTime() - 5 * hour).toISOString(),
      href: ROUTES.tasks,
    },
    {
      id: "notif_library_approved",
      title: "Asset added to library",
      summary: "Onboarding Welcome Series — Email was approved.",
      body: "An approved email snapshot is available in the Library. You can copy or download it for distribution.",
      kind: "library",
      createdAt: new Date(now.getTime() - 26 * hour).toISOString(),
      readAt: new Date(now.getTime() - 20 * hour).toISOString(),
      href: ROUTES.library,
    },
    {
      id: "notif_team_invite",
      title: "Team invite accepted",
      summary: "Maya Okonkwo joined your workspace.",
      body: "Maya Okonkwo (marketer) is now an active team member. You can assign tasks to her from the Tasks list.",
      kind: "team",
      createdAt: new Date(now.getTime() - 48 * hour).toISOString(),
      readAt: new Date(now.getTime() - 40 * hour).toISOString(),
      href: ROUTES.team,
    },
  ]
}
