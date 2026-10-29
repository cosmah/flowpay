import { PageHeader } from "@/components/layout/page-header"
import { TeamList } from "@/components/team/team-list"

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        description="Invite marketers and reviewers. Disable or delete members without affecting the signed-in account."
      />
      <TeamList />
    </div>
  )
}
