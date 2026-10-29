import { NotificationDetail } from "@/components/notifications/notification-detail"
import { PageHeader } from "@/components/layout/page-header"
import { RouteParams } from "@/components/shared/route-params"

export default function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div>
      <PageHeader
        title="Notification"
        description="Full message details and related workspace links."
      />
      <RouteParams>
        <NotificationBody params={params} />
      </RouteParams>
    </div>
  )
}

async function NotificationBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <NotificationDetail id={id} />
}
