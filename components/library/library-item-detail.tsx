"use client"

import Link from "next/link"
import { ApprovedBadge } from "@/components/library/approved-badge"
import { GraphicPreview } from "@/components/library/graphic-preview"
import { LibraryActions } from "@/components/library/library-actions"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useLibrary } from "@/hooks/use-library"
import { ROUTES } from "@/lib/constants/routes"

export function LibraryItemDetail({ itemId }: { itemId: string }) {
  const { getItem } = useLibrary()
  const item = getItem(itemId)

  if (!item) {
    return (
      <EmptyState
        title="Asset not found"
        description="Only approved library snapshots are available here."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.library}>Back to library</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.type}
          </p>
          <ApprovedBadge />
        </div>
        <h2 className="mt-2 font-heading text-xl text-[var(--rx-ink)]">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {item.campaignName} · Approved by {item.approvedBy} ·{" "}
          {new Date(item.approvedAt).toLocaleString()}
        </p>

        <div className="mt-4">
          <LibraryActions item={item} />
        </div>

        {item.type === "graphic" ? (
          <GraphicPreview
            content={item.content}
            title={item.title}
            className="mt-6 overflow-hidden rounded-xl border border-border/60 [&_svg]:h-auto [&_svg]:w-full"
          />
        ) : (
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {item.content}
          </pre>
        )}
      </div>
    </div>
  )
}
