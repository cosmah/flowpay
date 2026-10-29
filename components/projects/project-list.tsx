"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
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
import { ProjectForm } from "@/components/projects/project-form"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { PROJECT_STATUSES } from "@/lib/projects/validation"
import { ROUTES } from "@/lib/constants/routes"
import type { ProjectStatus } from "@/types"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | ProjectStatus
type SortKey =
  | "updated_desc"
  | "updated_asc"
  | "name_asc"
  | "name_desc"
  | "status"

export function ProjectList() {
  const { user } = useAuth()
  const { db, createProject } = useDb()
  const { activeProjectId, setActiveProjectId } = useProject()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("updated_desc")

  const stats = useMemo(() => {
    const counts = Object.fromEntries(
      PROJECT_STATUSES.map((item) => [item, 0])
    ) as Record<ProjectStatus, number>
    for (const project of db.projects) counts[project.status] += 1
    return [
      { label: "Total", value: db.projects.length, filter: "all" as StatusFilter },
      { label: "Active", value: counts.active, filter: "active" as StatusFilter },
      { label: "Paused", value: counts.paused, filter: "paused" as StatusFilter },
      {
        label: "Archived",
        value: counts.archived,
        filter: "archived" as StatusFilter,
      },
    ]
  }, [db.projects])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    let rows = db.projects.filter((project) => {
      if (status !== "all" && project.status !== status) return false
      if (!needle) return true
      return `${project.name} ${project.description}`
        .toLowerCase()
        .includes(needle)
    })

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "status":
          return a.status.localeCompare(b.status)
        case "updated_asc":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case "updated_desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return rows
  }, [db.projects, query, status, sort])

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setOpen(true)}>
          Add new
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => setStatus(stat.filter)}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition-colors",
              status === stat.filter
                ? "border-[var(--rx-ink)] bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                : "border-border/70 bg-[var(--rx-paper)] hover:border-[var(--rx-lagoon)]/40"
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              {stat.label}
            </p>
            <p className="mt-2 font-heading text-2xl tracking-tight">{stat.value}</p>
          </button>
        ))}
      </div>

      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search projects…"
        searchLabel="Search projects"
        filters={
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className={listControlClassName}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        }
        sort={
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className={listControlClassName}
            aria-label="Sort projects"
          >
            <option value="updated_desc">Newest updated</option>
            <option value="updated_asc">Oldest updated</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="status">Status</option>
          </select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects match"
          description="Create a project to group Relworx campaigns, or clear search and filters."
          action={
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              Add new
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
          {filtered.map((project) => {
            const campaignCount = db.campaigns.filter(
              (c) => c.projectId === project.id
            ).length
            const active = project.id === activeProjectId
            return (
              <li
                key={project.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link href={ROUTES.project(project.id)} className="min-w-0">
                  <p className="font-heading text-base text-[var(--rx-ink)]">
                    {project.name}
                    {active ? (
                      <span className="ml-2 text-xs font-medium text-[var(--rx-lagoon)]">
                        Active
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <p className="mt-2 text-xs capitalize text-muted-foreground">
                    {project.status} · {campaignCount} campaign
                    {campaignCount === 1 ? "" : "s"}
                  </p>
                </Link>
                <div className="flex gap-2">
                  {!active ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveProjectId(project.id)}
                    >
                      Switch to
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.projectEdit(project.id)}>Edit</Link>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add project</DialogTitle>
            <DialogDescription>
              Projects group Relworx campaigns. You can switch the active project
              from the top bar.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            mode="create"
            submitLabel="Create project"
            compact
            onCancel={() => setOpen(false)}
            onSubmit={(values) => {
              const project = createProject({
                ...values,
                createdBy: user?.role ?? "marketer",
              })
              setActiveProjectId(project.id)
              toast.success("Project created and selected.")
              setOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
