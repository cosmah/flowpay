"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProjectForm } from "@/components/projects/project-form"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { ROUTES } from "@/lib/constants/routes"

export function ProjectCreateForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { createProject } = useDb()
  const { setActiveProjectId } = useProject()

  return (
    <ProjectForm
      mode="create"
      submitLabel="Create project"
      onCancel={() => router.push(ROUTES.projects)}
      onSubmit={(values) => {
        const project = createProject({
          ...values,
          createdBy: user?.role ?? "marketer",
        })
        setActiveProjectId(project.id)
        toast.success("Project created and selected.")
        router.push(ROUTES.project(project.id))
      }}
    />
  )
}
