import { CampaignList } from "@/components/campaigns/campaign-list"
import { PageHeader } from "@/components/layout/page-header"

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create briefs, generate drafts, and track each campaign through review."
      />
      <CampaignList />
    </div>
  )
}
