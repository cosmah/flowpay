"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { canMarket } = useRole()
  const { db, deleteProject } = useDb()
  const { activeProjectId, setActiveProjectId } = useProject()
  const project = db.projects.find((item) => item.id === projectId)
  const campaigns = db.campaigns.filter((c) => c.projectId === projectId)

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project is not available."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.projects}>Back to projects</Link>
          </Button>
        }
      />
    )
  }

  async function onDelete() {
    const confirmed = window.confirm(
      `Delete “${project!.name}” and its ${campaigns.length} campaign(s)?`
    )
    if (!confirmed) return
    try {
      const ok = await deleteProject(project!.id)
      if (!ok) {
        toast.error("Could not delete this project.")
        return
      }
      toast.success("Project deleted.")
      router.push(ROUTES.projects)
    } catch (error) {
      handleClientError(error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl text-[var(--rx-ink)]">
            {project.name}
          </h2>
          <p className="mt-2 text-sm capitalize text-muted-foreground">
            {project.status}
            {activeProjectId === project.id ? " · Active project" : ""}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-foreground">
            {project.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeProjectId !== project.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActiveProjectId(project.id)
                toast.success(`Switched to ${project.name}`)
              }}
            >
              Switch to project
            </Button>
          ) : null}
          {canMarket ? (
            <>
              <Button asChild variant="outline">
                <Link href={ROUTES.projectEdit(project.id)}>Edit</Link>
              </Button>
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-lg text-[var(--rx-ink)]">
            Campaigns in this project
          </h3>
          {canMarket ? (
            <Button asChild size="sm">
              <Link href={ROUTES.campaignNew}>New campaign</Link>
            </Button>
          ) : null}
        </div>
        {campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            description={
              canMarket
                ? "Create a campaign under this project to start the content workflow."
                : "Marketers add campaigns under this project."
            }
          />
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={ROUTES.campaign(campaign.id)}
                  className="block px-5 py-4 hover:bg-muted/40"
                >
                  <p className="font-medium text-[var(--rx-ink)]">
                    {campaign.brief.title}
                  </p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {campaign.status.replaceAll("_", " ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
