import { PageHeader } from "@/components/layout/page-header"
import { NotificationsList } from "@/components/notifications/notifications-list"

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Review updates across tasks, approvals, library, and team activity."
      />
      <NotificationsList />
    </div>
  )
}
