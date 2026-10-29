import { PageHeader } from "@/components/layout/page-header"
import { TaskBoard } from "@/components/tasks/task-board"

export default function TaskBoardPage() {
  return (
    <div>
      <PageHeader
        title="Task board"
        description="Kanban for monitoring and evaluation — drag cards or move them between To do, In progress, and Done."
      />
      <TaskBoard />
    </div>
  )
}
