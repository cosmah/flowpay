"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
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
import type { TaskStatus } from "@/types"

type SortKey =
  | "due_asc"
  | "due_desc"
  | "title_asc"
  | "title_desc"
  | "status"
  | "owner"

export function TaskList() {
  const searchParams = useSearchParams()
  const ownerFromUrl = searchParams.get("owner")
  const { db } = useDb()
  const { tasks, updateTask } = useTasks()
  const { members } = useTeam()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all")
  const [sort, setSort] = useState<SortKey>("due_asc")

  useEffect(() => {
    if (!ownerFromUrl) return
    const match = members.find((member) => member.name === ownerFromUrl)
    setOwnerFilter(match?.name ?? ownerFromUrl)
  }, [ownerFromUrl, members])

  const campaignTitles = useMemo(() => {
    const map = new Map<string, string>()
    for (const campaign of db.campaigns) {
      map.set(campaign.id, campaign.brief.title)
    }
    return map
  }, [db.campaigns])

  const owners = useMemo(() => members.map((member) => member.name), [members])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    let rows = tasks.filter((task) => {
      if (ownerFilter !== "all" && task.owner !== ownerFilter) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (!needle) return true
      const campaign = campaignTitles.get(task.campaignId) ?? task.campaignId
      return `${task.title} ${task.owner} ${campaign}`
        .toLowerCase()
        .includes(needle)
    })

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "title_asc":
          return a.title.localeCompare(b.title)
        case "title_desc":
          return b.title.localeCompare(a.title)
        case "status":
          return a.status.localeCompare(b.status)
        case "owner":
          return a.owner.localeCompare(b.owner)
        case "due_desc":
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        case "due_asc":
        default:
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
    })

    return rows
  }, [tasks, ownerFilter, statusFilter, query, sort, campaignTitles])

  const campaignOptions = db.campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.brief.title,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setOpen(true)}>
          Add new
        </Button>
      </div>

      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search title, owner, or campaign…"
        searchLabel="Search tasks"
        filters={
          <>
            <select
              aria-label="Filter by owner"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className={listControlClassName}
            >
              <option value="all">All owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | TaskStatus)
              }
              className={listControlClassName}
            >
              <option value="all">All statuses</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </>
        }
        sort={
          <select
            aria-label="Sort tasks"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={listControlClassName}
          >
            <option value="due_asc">Due soonest</option>
            <option value="due_desc">Due latest</option>
            <option value="title_asc">Title A–Z</option>
            <option value="title_desc">Title Z–A</option>
            <option value="owner">Owner</option>
            <option value="status">Status</option>
          </select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks match"
          description="Adjust search or filters, submit a draft for review, or add a manual task."
          action={
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              Add new
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filtered.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-[var(--rx-ink)]">
                        {task.title}
                      </span>
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
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {campaignTitles.get(task.campaignId) ?? task.campaignId}
                  </td>
                  <td className="px-4 py-3 capitalize">{task.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(task.dueDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} />
                      <select
                        aria-label={`Status for ${task.title}`}
                        value={task.status}
                        onChange={(e) =>
                          updateTask(task.id, {
                            status: e.target.value as TaskStatus,
                          })
                        }
                        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>
              Create a manual task for this workflow.
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
