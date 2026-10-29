import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectDetail } from "@/components/projects/project-detail"

export const metadata: Metadata = {
  title: "Project details",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <PageHeader
        title="Project details"
        description="Manage this project and the campaigns that belong to it."
      />
      <ProjectDetail projectId={id} />
    </div>
  )
}
