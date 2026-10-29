import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectEditForm } from "@/components/projects/project-edit-form"

export const metadata: Metadata = {
  title: "Edit project",
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <PageHeader
        title="Update project"
        description="Change the project name, description, or status."
      />
      <ProjectEditForm projectId={id} />
    </div>
  )
}
