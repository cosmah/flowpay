"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { GraphicPreview } from "@/components/library/graphic-preview"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"
import type { DraftFormat } from "@/types"

type SortKey = "updated_desc" | "updated_asc" | "format" | "campaign"

export function ReviewQueue() {
  const { canReview } = useRole()
  const { db } = useDb()
  const pending = db.drafts.filter((d) => d.status === "in_review")

  const [query, setQuery] = useState("")
  const [formatFilter, setFormatFilter] = useState<"all" | DraftFormat>("all")
  const [sort, setSort] = useState<SortKey>("updated_desc")

  const campaignTitles = useMemo(() => {
    const map = new Map<string, string>()
    for (const campaign of db.campaigns) {
      map.set(campaign.id, campaign.brief.title)
    }
    return map
  }, [db.campaigns])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    let rows = pending.filter((draft) => {
      if (formatFilter !== "all" && draft.format !== formatFilter) return false
      if (!needle) return true
      const campaign = campaignTitles.get(draft.campaignId) ?? draft.campaignId
      return `${draft.format} ${draft.content} ${campaign}`
        .toLowerCase()
        .includes(needle)
    })

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "format":
          return a.format.localeCompare(b.format)
        case "campaign":
          return (campaignTitles.get(a.campaignId) ?? "").localeCompare(
            campaignTitles.get(b.campaignId) ?? ""
          )
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
  }, [pending, query, formatFilter, sort, campaignTitles])

  if (!canReview) {
    return (
      <EmptyState
        title="Reviewer role required"
        description="Sign in with a reviewer or admin account to approve drafts or request changes."
      />
    )
  }

  if (pending.length === 0) {
    return (
      <EmptyState
        title="Queue is empty"
        description="When marketers submit drafts, they appear here for approve or request changes."
      />
    )
  }

  return (
    <div className="space-y-6">
      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search draft content or campaign…"
        searchLabel="Search review queue"
        filters={
          <select
            aria-label="Filter by format"
            value={formatFilter}
            onChange={(e) =>
              setFormatFilter(e.target.value as "all" | DraftFormat)
            }
            className={listControlClassName}
          >
            <option value="all">All formats</option>
            <option value="caption">Caption</option>
            <option value="email">Email</option>
            <option value="visual">Visual</option>
          </select>
        }
        sort={
          <select
            aria-label="Sort review queue"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={listControlClassName}
          >
            <option value="updated_desc">Newest updated</option>
            <option value="updated_asc">Oldest updated</option>
            <option value="format">Format</option>
            <option value="campaign">Campaign</option>
          </select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No drafts match"
          description="Try a different search, format filter, or sort order."
        />
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
          {filtered.map((draft) => (
            <li key={draft.id}>
              <Link
                href={ROUTES.reviewDraft(draft.id)}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base capitalize text-[var(--rx-ink)]">
                    {draft.format} draft
                  </p>
                  {draft.format === "visual" ? (
                    <GraphicPreview
                      content={draft.content}
                      title={
                        campaignTitles.get(draft.campaignId) ?? "Visual draft"
                      }
                      className="mt-3 max-w-xs"
                    />
                  ) : (
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {draft.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {campaignTitles.get(draft.campaignId) ?? draft.campaignId}
                    {draft.authorName ? ` · by ${draft.authorName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={draft.status} />
                  <span className="text-xs font-medium text-[var(--rx-lagoon)]">
                    Review
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
