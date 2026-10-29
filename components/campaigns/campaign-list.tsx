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
import { CampaignForm } from "@/components/campaigns/campaign-form"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useProject } from "@/hooks/use-project"
import { useRole } from "@/hooks/use-role"
import { CAMPAIGN_STATUSES } from "@/lib/campaigns/validation"
import { ROUTES } from "@/lib/constants/routes"
import type { CampaignStatus } from "@/types"
import { cn } from "@/lib/utils"

type SortKey = "updated_desc" | "updated_asc" | "title_asc" | "title_desc" | "status"
type StatusFilter = "all" | CampaignStatus

export function CampaignList() {
  const { user } = useAuth()
  const { isMarketer } = useRole()
  const { db, createCampaign } = useDb()
  const { projects, activeProject, activeProjectId } = useProject()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("updated_desc")

  const projectCampaigns = useMemo(
    () =>
      activeProjectId
        ? db.campaigns.filter((c) => c.projectId === activeProjectId)
        : db.campaigns,
    [db.campaigns, activeProjectId]
  )

  const stats = useMemo(() => {
    const counts = Object.fromEntries(
      CAMPAIGN_STATUSES.map((item) => [item, 0])
    ) as Record<CampaignStatus, number>

    for (const campaign of projectCampaigns) {
      counts[campaign.status] += 1
    }

    return [
      { label: "Total", value: projectCampaigns.length, filter: "all" as StatusFilter },
      { label: "Draft", value: counts.draft, filter: "draft" as StatusFilter },
      { label: "In review", value: counts.in_review, filter: "in_review" as StatusFilter },
      { label: "Approved", value: counts.approved, filter: "approved" as StatusFilter },
      {
        label: "Changes",
        value: counts.changes_requested,
        filter: "changes_requested" as StatusFilter,
      },
    ]
  }, [projectCampaigns])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    let rows = projectCampaigns.filter((campaign) => {
      if (status !== "all" && campaign.status !== status) return false
      if (!needle) return true
      const haystack = [
        campaign.brief.title,
        campaign.brief.objective,
        campaign.brief.audience,
        campaign.brief.productService,
        campaign.brief.customerAction,
        campaign.brief.channels.join(" "),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(needle)
    })

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "title_asc":
          return a.brief.title.localeCompare(b.brief.title)
        case "title_desc":
          return b.brief.title.localeCompare(a.brief.title)
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
  }, [projectCampaigns, query, sort, status])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing campaigns for{" "}
          <span className="font-medium text-foreground">
            {activeProject?.name ?? "all projects"}
          </span>
          . Switch projects from the top bar.
        </p>
        {isMarketer ? (
          <Button
            type="button"
            onClick={() => setOpen(true)}
            disabled={projects.length === 0}
          >
            Add new
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                status === stat.filter
                  ? "text-[var(--rx-mist)]/80"
                  : "text-muted-foreground"
              )}
            >
              {stat.label}
            </p>
            <p className="mt-2 font-heading text-2xl tracking-tight">{stat.value}</p>
          </button>
        ))}
      </div>

      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search title, audience, product, action…"
        searchLabel="Search campaigns"
        filters={
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className={listControlClassName}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {CAMPAIGN_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        }
        sort={
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className={listControlClassName}
            aria-label="Sort campaigns"
          >
            <option value="updated_desc">Newest updated</option>
            <option value="updated_asc">Oldest updated</option>
            <option value="title_asc">Title A–Z</option>
            <option value="title_desc">Title Z–A</option>
            <option value="status">Status</option>
          </select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={
            projects.length === 0
              ? "Create a project first"
              : projectCampaigns.length === 0
                ? "No campaigns in this project"
                : "No matches"
          }
          description={
            projects.length === 0
              ? "Every campaign belongs to a project. Add a project, then write the Relworx brief."
              : projectCampaigns.length === 0
                ? "Create a Relworx brief with objective, audience, product/service, channel, tone, and customer action."
                : "Try a different search, status filter, or sort order."
          }
          action={
            projects.length === 0 ? (
              <Button asChild variant="outline">
                <Link href={ROUTES.projects}>Go to projects</Link>
              </Button>
            ) : isMarketer ? (
              <Button type="button" variant="outline" onClick={() => setOpen(true)}>
                Add new
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
          {filtered.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={ROUTES.campaign(campaign.id)}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base text-[var(--rx-ink)]">
                    {campaign.brief.title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {campaign.brief.objective}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {campaign.brief.productService} ·{" "}
                    {campaign.brief.channels.join(" · ")} · Updated{" "}
                    {new Date(campaign.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={campaign.status} />
                  <span className="text-xs font-medium text-[var(--rx-lagoon)]">
                    View
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add campaign</DialogTitle>
            <DialogDescription>
              Write a Relworx brief with objective, audience, product/service,
              channel, tone, and customer action.
            </DialogDescription>
          </DialogHeader>
          {projects.length === 0 ? (
            <EmptyState
              title="Create a project first"
              description="Every campaign belongs to a project."
              action={
                <Button asChild>
                  <Link href={ROUTES.projects}>Go to projects</Link>
                </Button>
              }
            />
          ) : (
            <CampaignForm
              mode="create"
              projects={projects}
              defaultProjectId={activeProjectId ?? projects[0].id}
              submitLabel="Create campaign"
              compact
              onCancel={() => setOpen(false)}
              onSubmit={({ projectId, brief, status: nextStatus }) => {
                const campaign = createCampaign({
                  projectId,
                  brief,
                  status: nextStatus,
                  createdBy: user?.role ?? "marketer",
                })
                toast.success("Campaign brief saved.")
                setOpen(false)
                window.location.assign(ROUTES.campaign(campaign.id))
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
