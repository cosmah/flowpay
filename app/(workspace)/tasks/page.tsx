import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Review tasks show owner, due date, and status. Submitting a draft auto-creates a task due in 24 hours."
      />
      <EmptyState
        title="No open tasks"
        description="When a marketer submits a draft, a reviewer task appears here automatically."
      />
    </div>
  )
}
