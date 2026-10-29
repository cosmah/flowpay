"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"

export function TaskList() {
  const { db } = useDb()
  const tasks = db.tasks

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No open tasks"
        description="When a marketer submits a draft, a reviewer task appears here automatically."
      />
    )
  }

  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-heading text-base text-[var(--rx-ink)]">
              {task.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Owner: {task.ownerRole} · Due{" "}
              {new Date(task.dueAt).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={task.status} />
        </li>
      ))}
    </ul>
  )
}
