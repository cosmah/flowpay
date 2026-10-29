"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CampaignForm } from "@/components/campaigns/campaign-form"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { ROUTES } from "@/lib/constants/routes"

export function CampaignCreateForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { createCampaign } = useDb()

  return (
    <CampaignForm
      mode="create"
      submitLabel="Create campaign"
      onCancel={() => router.push(ROUTES.campaigns)}
      onSubmit={({ brief, status }) => {
        const campaign = createCampaign({
          brief,
          status,
          createdBy: user?.role ?? "marketer",
        })
        toast.success("Campaign created.")
        router.push(ROUTES.campaign(campaign.id))
      }}
    />
  )
}
