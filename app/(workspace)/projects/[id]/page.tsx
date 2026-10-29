import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectDetail } from "@/components/projects/project-detail"
import { RouteParams } from "@/components/shared/route-params"

export const metadata: Metadata = {
  title: "Project details",
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div>
      <PageHeader
        title="Project details"
        description="Manage this project and the campaigns that belong to it."
      />
      <RouteParams>
        <ProjectDetailBody params={params} />
      </RouteParams>
    </div>
  )
}

async function ProjectDetailBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProjectDetail projectId={id} />
}
