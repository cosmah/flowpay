import { CampaignDetail } from "@/components/campaigns/campaign-detail"
import { PageHeader } from "@/components/layout/page-header"

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
        description="Drafts and visual for this campaign. Submit sends items to the review queue."
      />
      <CampaignDetail campaignId={id} />
    </div>
  )
}
