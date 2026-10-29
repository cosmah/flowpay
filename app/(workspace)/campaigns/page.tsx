import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CampaignList } from "@/components/campaigns/campaign-list"
import { PageHeader } from "@/components/layout/page-header"
import { ROUTES } from "@/lib/constants/routes"

export default function CampaignsPage() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create briefs, generate drafts, and track each campaign through review."
        actions={
          <Button asChild>
            <Link href={ROUTES.campaignNew}>New campaign</Link>
          </Button>
        }
      />
      <CampaignList />
    </div>
  )
}
