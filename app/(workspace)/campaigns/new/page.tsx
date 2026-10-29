import type { Metadata } from "next"
import { RoleGate } from "@/components/auth/role-gate"
import { CampaignCreateForm } from "@/components/campaigns/campaign-create-form"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = {
  title: "New campaign",
}

export default function NewCampaignPage() {
  return (
    <RoleGate allow="market">
      <div className="w-full">
        <PageHeader
          title="New campaign"
          description="Add post content, attach banner images, and choose where it will publish."
        />
        <CampaignCreateForm />
      </div>
    </RoleGate>
  )
}
