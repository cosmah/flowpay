import { PageHeader } from "@/components/layout/page-header"
import { TaskList } from "@/components/tasks/task-list"

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Review tasks show owner, due date, and status. Submitting a draft auto-creates a task due in 24 hours."
      />
      <TaskList />
    </div>
  )
}
