import type { Metadata } from "next"
import { CampaignCreateForm } from "@/components/campaigns/campaign-create-form"
import { CampaignCreateHero } from "@/components/campaigns/campaign-create-hero"

export const metadata: Metadata = {
  title: "New campaign",
}

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <CampaignCreateHero />
      <CampaignCreateForm />
    </div>
  )
}
