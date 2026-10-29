import type { Metadata } from "next"
import { RoleGate } from "@/components/auth/role-gate"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectCreateForm } from "@/components/projects/project-create-form"

export const metadata: Metadata = {
  title: "New project",
}

export default function NewProjectPage() {
  return (
    <RoleGate allow="market">
      <div>
        <PageHeader
          title="New project"
          description="Create a project container for campaign posts and drafts."
        />
        <ProjectCreateForm />
      </div>
    </RoleGate>
  )
}
