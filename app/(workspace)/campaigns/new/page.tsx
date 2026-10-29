import type { Metadata } from "next"
import { CampaignCreateForm } from "@/components/campaigns/campaign-create-form"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = {
  title: "New campaign",
}

export default function NewCampaignPage() {
  return (
    <div>
      <PageHeader
        title="New campaign"
        description="Fill in the brief. Missing fields show clear validation before the campaign is saved."
      />
      <CampaignCreateForm />
    </div>
  )
}
