"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { useRole } from "@/hooks/use-role"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { handleClientError } from "@/lib/errors"
import type { Draft, DraftFormat } from "@/types"

type SortKey = "updated_desc" | "updated_asc" | "format" | "campaign"

export function ReviewQueue() {
  const { isReviewer } = useRole()
  const { currentUser, getMarketers } = useTeam()
  const { db, approveDraft, requestDraftChanges } = useDb()
  const { handleDraftApproved, handleChangesRequested } = useTasks()
  const pending = db.drafts.filter((d) => d.status === "in_review")

  const [query, setQuery] = useState("")
  const [formatFilter, setFormatFilter] = useState<"all" | DraftFormat>("all")
  const [sort, setSort] = useState<SortKey>("updated_desc")
  const [comments, setComments] = useState<Record<string, string>>({})

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

  async function onApprove(draft: Draft) {
    try {
      const updated = await approveDraft(draft.id, currentUser.email)
      if (!updated) {
        toast.error("Could not approve this draft.")
        return
      }
      const campaign = db.campaigns.find((c) => c.id === updated.campaignId)
      handleDraftApproved(updated, {
        items: [],
        addItem: (item) => ({
          id: item.id ?? `lib_${crypto.randomUUID().slice(0, 8)}`,
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          draftId: item.draftId,
          type: item.type,
          title: item.title,
          content: item.content,
          approvedBy: item.approvedBy,
          approvedAt: item.approvedAt,
          tags: item.tags,
        }),
        campaignName: campaign?.brief.title ?? "Unknown campaign",
        reviewer: currentUser.name,
      })
      toast.success("Draft approved.")
    } catch (error) {
      handleClientError(error)
    }
  }

  async function onRequestChanges(draft: Draft) {
    const body = (comments[draft.id] ?? "").trim()
    if (!body) {
      toast.error("Add a comment for the marketer.")
      return
    }

    try {
      const updated = await requestDraftChanges(
        draft.id,
        body,
        currentUser.email
      )
      if (!updated) {
        toast.error("Could not request changes.")
        return
      }
      const fallbackAuthor = getMarketers()[0]?.name ?? "marketer"
      handleChangesRequested(updated, {
        authorName: updated.authorName ?? fallbackAuthor,
      })
      setComments((prev) => ({ ...prev, [draft.id]: "" }))
      toast.success("Changes requested.")
    } catch (error) {
      handleClientError(error)
    }
  }

  if (!isReviewer) {
    return (
      <EmptyState
        title="Reviewer role required"
        description="Switch to a reviewer in the header to approve drafts or request changes."
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
            <li key={draft.id} className="space-y-4 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading text-base capitalize text-[var(--rx-ink)]">
                    {draft.format} draft
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {draft.content}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {campaignTitles.get(draft.campaignId) ?? draft.campaignId}
                    {draft.authorName ? ` · by ${draft.authorName}` : ""} · via{" "}
                    {draft.generationSource}
                  </p>
                </div>
                <StatusBadge status={draft.status} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`change-${draft.id}`}>
                  Request changes comment
                </Label>
                <Textarea
                  id={`change-${draft.id}`}
                  value={comments[draft.id] ?? ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [draft.id]: e.target.value,
                    }))
                  }
                  placeholder="What should the marketer change?"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => onApprove(draft)}>
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onRequestChanges(draft)}
                >
                  Request changes
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
