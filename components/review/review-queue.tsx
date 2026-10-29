"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"

export function ReviewQueue() {
  const { db } = useDb()
  const pending = db.drafts.filter((d) => d.status === "in_review")

  if (pending.length === 0) {
    return (
      <EmptyState
        title="Queue is empty"
        description="Switch to the Reviewer role when drafts are submitted. Approvals publish items into the library."
      />
    )
  }

  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {pending.map((draft) => (
        <li
          key={draft.id}
          className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-heading text-base capitalize text-[var(--rx-ink)]">
              {draft.format} draft
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {draft.content}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Campaign {draft.campaignId} · via {draft.generationSource}
            </p>
          </div>
          <StatusBadge status={draft.status} />
        </li>
      ))}
    </ul>
  )
}
