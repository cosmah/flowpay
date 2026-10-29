import type { Metadata } from "next"
import { RoleGate } from "@/components/auth/role-gate"
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
    <RoleGate allow="market">
      <div>
        <PageHeader
          title="Update campaign"
          description="Update post content, banners, channels, or status."
        />
        <RouteParams>
          <CampaignEditBody params={params} />
        </RouteParams>
      </div>
    </RoleGate>
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
