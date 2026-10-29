import { PageHeader } from "@/components/layout/page-header"
import { TaskList } from "@/components/tasks/task-list"

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Review, revise, and manual tasks. Submitting a draft auto-creates a review task due in 24 hours."
      />
      <TaskList />
    </div>
  )
}
