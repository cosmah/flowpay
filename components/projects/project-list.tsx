"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { PROJECT_STATUSES } from "@/lib/projects/validation"
import { ROUTES } from "@/lib/constants/routes"
import type { ProjectStatus } from "@/types"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | ProjectStatus

export function ProjectList() {
  const { db } = useDb()
  const { activeProjectId, setActiveProjectId } = useProject()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")

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
    return db.projects
      .filter((project) => {
        if (status !== "all" && project.status !== status) return false
        if (!needle) return true
        return `${project.name} ${project.description}`
          .toLowerCase()
          .includes(needle)
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
  }, [db.projects, query, status])

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects…"
            className="h-10 pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Projects group Relworx campaigns. Create one, then switch it from the top bar."
          action={
            <Button asChild variant="outline">
              <Link href={ROUTES.projectNew}>New project</Link>
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
    </div>
  )
}
