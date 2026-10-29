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
      projects={[]}
      submitLabel="Create campaign"
      onCancel={() => router.push(ROUTES.campaigns)}
      onSubmit={async ({ brief, status }) => {
        const result = await createCampaign({
          projectId: "",
          brief,
          status,
          createdBy: user?.email ?? "marketer",
        })
        if ("error" in result) {
          toast.error(result.error)
          return
        }
        toast.success("Campaign brief saved.")
        router.push(ROUTES.campaign(result.id))
      }}
    />
  )
}
