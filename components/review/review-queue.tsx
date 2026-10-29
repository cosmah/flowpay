"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useLibrary } from "@/hooks/use-library"
import { useRole } from "@/hooks/use-role"
import { useTasks } from "@/hooks/use-tasks"
import { handleClientError } from "@/lib/errors"
import type { Draft, DraftFormat } from "@/types"

type SortKey = "updated_desc" | "updated_asc" | "format" | "campaign"

export function ReviewQueue() {
  const { role } = useRole()
  const { user } = useAuth()
  const { db, approveDraft, requestDraftChanges } = useDb()
  const { handleDraftApproved, handleChangesRequested } = useTasks()
  const { approvalStore } = useLibrary()
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

  function onApprove(draft: Draft) {
    try {
      const updated = approveDraft(draft.id)
      if (!updated) {
        toast.error("Could not approve this draft.")
        return
      }
      const campaign = db.campaigns.find((c) => c.id === updated.campaignId)
      handleDraftApproved(updated, {
        get items() {
          return approvalStore.items
        },
        addItem: approvalStore.addItem,
        campaignName: campaign?.brief.title ?? "Unknown campaign",
        reviewer: user?.name ?? "reviewer",
      })
      toast.success("Draft approved.")
    } catch (error) {
      handleClientError(error)
    }
  }

  function onRequestChanges(draft: Draft) {
    const body = window.prompt("What should the marketer change?")
    if (body === null) return
    if (!body.trim()) {
      toast.error("Add a short note for the marketer.")
      return
    }

    try {
      const updated = requestDraftChanges(draft.id, body.trim())
      if (!updated) {
        toast.error("Could not request changes.")
        return
      }
      handleChangesRequested(updated)
      toast.success("Changes requested.")
    } catch (error) {
      handleClientError(error)
    }
  }

  if (pending.length === 0) {
    return (
      <EmptyState
        title="Queue is empty"
        description="Switch to the Reviewer role when drafts are submitted. Approvals publish items into the library."
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
            <li
              key={draft.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-heading text-base capitalize text-[var(--rx-ink)]">
                  {draft.format} draft
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {draft.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {campaignTitles.get(draft.campaignId) ?? draft.campaignId} ·
                  via {draft.generationSource}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={draft.status} />
                {role === "reviewer" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onApprove(draft)}
                    >
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
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
