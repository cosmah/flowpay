import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { ProjectList } from "@/components/projects/project-list"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = {
  title: "Projects",
}

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Projects group Relworx campaigns. Switch the active project from the top bar or sidebar."
        actions={
          <Button asChild>
            <Link href={ROUTES.projectNew}>New project</Link>
          </Button>
        }
      />
      <ProjectList />
    </div>
  )
}
