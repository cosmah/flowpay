import { RoleGate } from "@/components/auth/role-gate"
import { PageHeader } from "@/components/layout/page-header"
import { TeamList } from "@/components/team/team-list"

export default function TeamPage() {
  return (
    <RoleGate allow="manageTeam">
      <div>
        <PageHeader
          title="Team"
          description="Invite marketers and reviewers. Disable members without affecting your own account."
        />
        <TeamList />
      </div>
    </RoleGate>
  )
}
