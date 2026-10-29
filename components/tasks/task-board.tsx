"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Kanban, LayoutList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { AddTaskForm } from "@/components/tasks/add-task-form"
import { useDb } from "@/hooks/use-db"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import type { TaskStatus, TaskWithMeta } from "@/types"
import { taskOwnerLabel, taskOwnerMatches } from "@/types"
import { cn } from "@/lib/utils"

const COLUMNS: { id: TaskStatus; title: string; hint: string }[] = [
  { id: "todo", title: "To do", hint: "Queued work" },
  { id: "in_progress", title: "In progress", hint: "Active monitoring" },
  { id: "done", title: "Done", hint: "Evaluated / closed" },
]

export function TaskBoard() {
  const { db } = useDb()
  const { tasks, updateTask } = useTasks()
  const { members } = useTeam()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const campaignTitles = useMemo(() => {
    const map = new Map<string, string>()
    for (const campaign of db.campaigns) {
      map.set(campaign.id, campaign.brief.title)
    }
    return map
  }, [db.campaigns])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tasks.filter((task) => {
      if (ownerFilter !== "all") {
        const selected = members.find((member) => member.email === ownerFilter)
        if (selected) {
          if (!taskOwnerMatches(task.owner, selected)) return false
        } else if (task.owner !== ownerFilter) {
          return false
        }
      }
      if (!needle) return true
      const campaign = campaignTitles.get(task.campaignId) ?? task.campaignId
      const owner = taskOwnerLabel(task.owner, members)
      return `${task.title} ${owner} ${task.owner} ${campaign}`
        .toLowerCase()
        .includes(needle)
    })
  }, [tasks, ownerFilter, query, campaignTitles, members])

  const byColumn = useMemo(() => {
    const groups: Record<TaskStatus, TaskWithMeta[]> = {
      todo: [],
      in_progress: [],
      done: [],
    }
    for (const task of filtered) {
      groups[task.status].push(task)
    }
    return groups
  }, [filtered])

  const campaignOptions = db.campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.brief.title,
  }))

  function moveTask(taskId: string, status: TaskStatus) {
    void updateTask(taskId, { status })
    setDraggingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border/70 bg-[var(--rx-paper)] p-1">
          <Button asChild size="sm" variant="ghost" className="gap-1.5">
            <Link href={ROUTES.tasks}>
              <LayoutList />
              List
            </Link>
          </Button>
          <Button size="sm" variant="secondary" className="gap-1.5" disabled>
            <Kanban />
            Board
          </Button>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          Add new
        </Button>
      </div>

      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search board…"
        searchLabel="Search task board"
        filters={
          <select
            aria-label="Filter by owner"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className={listControlClassName}
          >
            <option value="all">All owners</option>
            {members.map((member) => (
              <option key={member.id} value={member.email}>
                {member.name}
              </option>
            ))}
          </select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks on this board"
          description="Add a manual task or submit a draft to create review work."
          action={
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              Add new
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((column) => (
            <section
              key={column.id}
              className="flex min-h-[28rem] flex-col rounded-2xl border border-border/70 bg-muted/20"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const taskId =
                  event.dataTransfer.getData("text/task-id") || draggingId
                if (taskId) moveTask(taskId, column.id)
              }}
            >
              <header className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
                <div>
                  <h3 className="font-heading text-base text-[var(--rx-ink)]">
                    {column.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{column.hint}</p>
                </div>
                <Badge variant="outline" className="tabular-nums">
                  {byColumn[column.id].length}
                </Badge>
              </header>

              <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
                {byColumn[column.id].map((task) => (
                  <li key={task.id}>
                    <article
                      draggable
                      onDragStart={(event) => {
                        setDraggingId(task.id)
                        event.dataTransfer.setData("text/task-id", task.id)
                        event.dataTransfer.effectAllowed = "move"
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        "cursor-grab rounded-xl border border-border/70 bg-[var(--rx-paper)] p-3 shadow-sm active:cursor-grabbing",
                        draggingId === task.id && "opacity-60"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-sm text-[var(--rx-ink)]">
                          {task.title}
                        </p>
                        {task.autoGenerated ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            Auto
                          </Badge>
                        ) : null}
                        {task.isOverdue ? (
                          <Badge className="bg-destructive text-destructive-foreground">
                            Overdue
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {campaignTitles.get(task.campaignId) ?? task.campaignId}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs capitalize text-muted-foreground">
                          {taskOwnerLabel(task.owner, members)}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {COLUMNS.filter((c) => c.id !== task.status).map(
                          (target) => (
                            <Button
                              key={target.id}
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => moveTask(task.id, target.id)}
                            >
                              → {target.title}
                            </Button>
                          )
                        )}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>
              New cards land in To do for monitoring on this board.
            </DialogDescription>
          </DialogHeader>
          <AddTaskForm
            campaigns={campaignOptions}
            compact
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
