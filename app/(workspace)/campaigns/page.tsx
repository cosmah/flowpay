import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
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
      <EmptyState
        title="No campaigns yet"
        description="Start with a brief. Validated fields unlock generation of caption, email, and visual drafts."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.campaignNew}>Create brief</Link>
          </Button>
        }
      />
    </div>
  )
}
