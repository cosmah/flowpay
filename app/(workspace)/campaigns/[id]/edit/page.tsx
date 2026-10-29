import type { Metadata } from "next"
import { CampaignEditForm } from "@/components/campaigns/campaign-edit-form"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = {
  title: "Edit campaign",
}

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Update campaign"
        description="Change brief fields or status. Validation blocks incomplete or invalid input."
      />
      <CampaignEditForm campaignId={id} />
    </div>
  )
}
