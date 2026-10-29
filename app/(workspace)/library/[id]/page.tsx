import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Approved item"
        description={`Copy, download, or send a simulated test email for library item ${id}.`}
      />
      <EmptyState
        title="Asset detail placeholder"
        description="Test send will log a simulated row by default. Live Resend delivery is a stretch goal."
      />
    </div>
  )
}
