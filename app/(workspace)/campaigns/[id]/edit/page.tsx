import type { Metadata } from "next"
import { CampaignEditForm } from "@/components/campaigns/campaign-edit-form"
import { PageHeader } from "@/components/layout/page-header"
import { RouteParams } from "@/components/shared/route-params"

export const metadata: Metadata = {
  title: "Edit campaign",
}

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div>
      <PageHeader
        title="Update campaign"
        description="Change brief fields or status. Validation blocks incomplete or invalid input."
      />
      <RouteParams>
        <CampaignEditBody params={params} />
      </RouteParams>
    </div>
  )
}

async function CampaignEditBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CampaignEditForm campaignId={id} />
}
