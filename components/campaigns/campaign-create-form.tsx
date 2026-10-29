"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CampaignForm } from "@/components/campaigns/campaign-form"
import { EmptyState } from "@/components/shared/empty-state"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { ROUTES } from "@/lib/constants/routes"

export function CampaignCreateForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { createCampaign } = useDb()
  const { projects, activeProjectId } = useProject()

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Create a project first"
        description="Every campaign belongs to a project. Add a project, then write the Relworx brief."
        action={
          <Button asChild>
            <Link href={ROUTES.projectNew}>New project</Link>
          </Button>
        }
      />
    )
  }

  return (
    <CampaignForm
      mode="create"
      projects={projects}
      defaultProjectId={activeProjectId ?? projects[0].id}
      submitLabel="Create campaign"
      onCancel={() => router.push(ROUTES.campaigns)}
      onSubmit={({ projectId, brief, status }) => {
        const campaign = createCampaign({
          projectId,
          brief,
          status,
          createdBy: user?.role ?? "marketer",
        })
        toast.success("Campaign brief saved.")
        router.push(ROUTES.campaign(campaign.id))
      }}
    />
  )
}
