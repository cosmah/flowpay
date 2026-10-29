import type { Metadata } from "next"
import { CampaignDetail } from "@/components/campaigns/campaign-detail"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = {
  title: "Campaign details",
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Campaign details"
        description="Review the brief, drafts, and status. Edit to update fields or change workflow status."
      />
      <CampaignDetail campaignId={id} />
    </div>
  )
}
