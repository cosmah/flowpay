"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ApprovedBadge } from "@/components/library/approved-badge"
import { GraphicPreview } from "@/components/library/graphic-preview"
import { LibraryActions } from "@/components/library/library-actions"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useLibrary } from "@/hooks/use-library"
import { channelLabel } from "@/lib/library/channels"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

export function LibraryItemDetail({ itemId }: { itemId: string }) {
  const { getItem, items } = useLibrary()
  const item = getItem(itemId)

  const versions = useMemo(() => {
    if (!item) return []
    const siblings = items.filter(
      (row) =>
        row.campaignId === item.campaignId &&
        row.draftId === item.draftId
    )
    if (siblings.length === 0) return [item]
    return [...siblings].sort((a, b) =>
      (a.channel ?? "").localeCompare(b.channel ?? "")
    )
  }, [item, items])

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
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.channel ? channelLabel(item.channel) : item.type}
          </p>
          <ApprovedBadge />
        </div>
        <h2 className="mt-2 font-heading text-xl text-[var(--rx-ink)]">
          {item.title.replace(/\s·\s[a-z]+$/i, "")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {item.campaignName} · Approved by {item.approvedBy} ·{" "}
          {new Date(item.approvedAt).toLocaleString()}
        </p>

        <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {item.content}
        </pre>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="mt-4 max-h-[28rem] w-full rounded-xl border border-border/60 object-contain"
          />
        ) : item.type === "graphic" ? (
          <GraphicPreview
            content={item.content}
            title={item.title}
            className="mt-6 overflow-hidden rounded-xl border border-border/60 [&_svg]:h-auto [&_svg]:w-full"
          />
        ) : null}
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="font-heading text-lg text-[var(--rx-ink)]">
            Channel versions
          </h3>
          <p className="text-sm text-muted-foreground">
            One version per site selected on the campaign. Push opens that
            channel&apos;s share flow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {versions.map((version) => {
            const active = version.id === item.id
            return (
              <article
                key={version.id}
                className={cn(
                  "space-y-4 rounded-2xl border bg-[var(--rx-paper)] px-4 py-4",
                  active
                    ? "border-[var(--rx-ink)]"
                    : "border-border/70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-base text-[var(--rx-ink)]">
                      {version.channel
                        ? channelLabel(version.channel)
                        : "Version"}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {version.content}
                    </p>
                  </div>
                  {!active ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={ROUTES.libraryItem(version.id)}>Open</Link>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Current
                    </span>
                  )}
                </div>
                {version.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={version.imageUrl}
                    alt=""
                    className="aspect-[16/9] w-full rounded-lg border border-border/60 object-cover"
                  />
                ) : null}
                <LibraryActions item={version} />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
