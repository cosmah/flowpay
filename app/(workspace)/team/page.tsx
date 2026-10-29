import { PageHeader } from "@/components/layout/page-header"
import { TeamList } from "@/components/team/team-list"

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        description="Switch users from the header. Open and overdue task counts come from the Tasks store."
      />
      <TeamList />
    </div>
  )
}
