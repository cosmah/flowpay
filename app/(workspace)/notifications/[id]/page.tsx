import { NotificationDetail } from "@/components/notifications/notification-detail"
import { PageHeader } from "@/components/layout/page-header"

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Notification"
        description="Full message details and related workspace links."
      />
      <NotificationDetail id={id} />
    </div>
  )
}
