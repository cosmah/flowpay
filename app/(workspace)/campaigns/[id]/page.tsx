import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Campaign detail"
        description={`Drafts and visual for campaign ${id}. Submit sends items to the review queue.`}
      />
      <EmptyState
        title="Draft workspace placeholder"
        description="Marketers will edit caption and email drafts here, then submit for review. Changes requested returns drafts for revision."
      />
    </div>
  )
}
