"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { CAMPAIGN_STATUSES } from "@/lib/campaigns/validation"
import { ROUTES } from "@/lib/constants/routes"
import type { CampaignStatus } from "@/types"
import { cn } from "@/lib/utils"

type SortKey = "updated_desc" | "updated_asc" | "title_asc" | "title_desc" | "status"

type StatusFilter = "all" | CampaignStatus

export function CampaignList() {
  const { db } = useDb()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("updated_desc")

  const stats = useMemo(() => {
    const counts = Object.fromEntries(
      CAMPAIGN_STATUSES.map((item) => [item, 0])
    ) as Record<CampaignStatus, number>

    for (const campaign of db.campaigns) {
      counts[campaign.status] += 1
    }

    return [
      { label: "Total", value: db.campaigns.length, filter: "all" as StatusFilter },
      { label: "Draft", value: counts.draft, filter: "draft" as StatusFilter },
      {
        label: "In review",
        value: counts.in_review,
        filter: "in_review" as StatusFilter,
      },
      {
        label: "Approved",
        value: counts.approved,
        filter: "approved" as StatusFilter,
      },
      {
        label: "Changes",
        value: counts.changes_requested,
        filter: "changes_requested" as StatusFilter,
      },
    ]
  }, [db.campaigns])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    let rows = db.campaigns.filter((campaign) => {
      if (status !== "all" && campaign.status !== status) return false
      if (!needle) return true
      const haystack = [
        campaign.brief.title,
        campaign.brief.objective,
        campaign.brief.audience,
        campaign.brief.keyMessage,
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
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          )
        case "updated_desc":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      }
    })

    return rows
  }, [db.campaigns, query, sort, status])

  return (
    <div className="space-y-6">
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
            <p className="mt-2 font-heading text-2xl tracking-tight">
              {stat.value}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, audience, message…"
            className="h-10 pl-9"
            aria-label="Search campaigns"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {CAMPAIGN_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Sort campaigns"
        >
          <option value="updated_desc">Newest updated</option>
          <option value="updated_asc">Oldest updated</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
          <option value="status">Status</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={db.campaigns.length === 0 ? "No campaigns yet" : "No matches"}
          description={
            db.campaigns.length === 0
              ? "Start with a brief. Validated fields unlock generation of caption, email, and visual drafts."
              : "Try a different search, status filter, or sort order."
          }
          action={
            db.campaigns.length === 0 ? (
              <Button asChild variant="outline">
                <Link href={ROUTES.campaignNew}>Create brief</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setStatus("all")
                  setSort("updated_desc")
                }}
              >
                Clear filters
              </Button>
            )
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
    </div>
  )
}
