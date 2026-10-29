import type { Metadata } from "next"
import { RoleGate } from "@/components/auth/role-gate"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectEditForm } from "@/components/projects/project-edit-form"
import { RouteParams } from "@/components/shared/route-params"

export const metadata: Metadata = {
  title: "Edit project",
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <RoleGate allow="market">
      <div>
        <PageHeader
          title="Update project"
          description="Change the project name, description, or status."
        />
        <RouteParams>
          <ProjectEditBody params={params} />
        </RouteParams>
      </div>
    </RoleGate>
  )
}

async function ProjectEditBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProjectEditForm projectId={id} />
}
