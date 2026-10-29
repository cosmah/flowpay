import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectCreateForm } from "@/components/projects/project-create-form"

export const metadata: Metadata = {
  title: "New project",
}

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader
        title="New project"
        description="Create a project container for Relworx campaign briefs and drafts."
      />
      <ProjectCreateForm />
    </div>
  )
}
