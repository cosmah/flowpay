import type { Metadata } from "next"
import { CampaignDetail } from "@/components/campaigns/campaign-detail"
import { PageHeader } from "@/components/layout/page-header"
import { RouteParams } from "@/components/shared/route-params"

export const metadata: Metadata = {
  title: "Campaign details",
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div>
      <PageHeader
        title="Campaign details"
        description="Review the brief, drafts, and status. Edit to update fields or change workflow status."
      />
      <RouteParams>
        <CampaignDetailBody params={params} />
      </RouteParams>
    </div>
  )
}

async function CampaignDetailBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CampaignDetail campaignId={id} />
}
