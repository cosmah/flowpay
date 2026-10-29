"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CampaignForm } from "@/components/campaigns/campaign-form"
import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { ROUTES } from "@/lib/constants/routes"

export function CampaignEditForm({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const { db, updateCampaign } = useDb()
  const { projects } = useProject()
  const campaign = db.campaigns.find((item) => item.id === campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign cannot be edited because it is not in the current session."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.campaigns}>Back to campaigns</Link>
          </Button>
        }
      />
    )
  }

  return (
    <CampaignForm
      mode="edit"
      initial={campaign}
      projects={projects}
      defaultProjectId={campaign.projectId}
      submitLabel="Save changes"
      onCancel={() => router.push(ROUTES.campaign(campaign.id))}
      onSubmit={({ projectId, brief, status }) => {
        const updated = updateCampaign(campaign.id, {
          projectId,
          brief,
          status,
        })
        if (!updated) {
          toast.error("Could not update this campaign.")
          return
        }
        toast.success("Campaign updated.")
        router.push(ROUTES.campaign(campaign.id))
      }}
    />
  )
}
