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
        description="Relworx brief: objective, audience, service/product, channel, tone, and desired customer action. Missing fields show a clear message."
      />
      <CampaignCreateForm />
    </div>
  )
}
