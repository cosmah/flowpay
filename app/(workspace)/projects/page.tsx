import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectList } from "@/components/projects/project-list"

export const metadata: Metadata = {
  title: "Projects",
}

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Projects group Relworx campaigns. Switch the active project from the top bar or sidebar."
      />
      <ProjectList />
    </div>
  )
}
