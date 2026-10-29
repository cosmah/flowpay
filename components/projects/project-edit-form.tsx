"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ProjectForm } from "@/components/projects/project-form"
import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"
import { ROUTES } from "@/lib/constants/routes"

export function ProjectEditForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { db, updateProject } = useDb()
  const project = db.projects.find((item) => item.id === projectId)

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

  return (
    <ProjectForm
      mode="edit"
      initial={project}
      submitLabel="Save changes"
      onCancel={() => router.push(ROUTES.project(project.id))}
      onSubmit={async (values) => {
        const updated = await updateProject(project.id, values)
        if (!updated) {
          toast.error("Could not update this project.")
          return
        }
        toast.success("Project updated.")
        router.push(ROUTES.project(project.id))
      }}
    />
  )
}
