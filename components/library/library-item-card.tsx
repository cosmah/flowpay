"use client"

import Link from "next/link"
import { ApprovedBadge } from "@/components/library/approved-badge"
import { GraphicPreview } from "@/components/library/graphic-preview"
import { LibraryActions } from "@/components/library/library-actions"
import { ROUTES } from "@/lib/constants/routes"
import type { LibraryItem } from "@/types"
import { cn } from "@/lib/utils"

export function LibraryItemCard({
  item,
  layout,
}: {
  item: LibraryItem
  layout: "list" | "grid"
}) {
  const isGrid = layout === "grid"

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-[var(--rx-paper)]",
        isGrid
          ? "flex h-full min-w-0 flex-col gap-3 p-4"
          : "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
      )}
    >
      <div className={cn("min-w-0", isGrid ? "flex flex-1 flex-col gap-3" : "flex-1")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
            {item.type}
          </span>
          <ApprovedBadge />
        </div>

        <div className={cn(!isGrid && "mt-2")}>
          <Link
            href={ROUTES.libraryItem(item.id)}
            className={cn(
              "font-heading text-[var(--rx-ink)] hover:underline",
              isGrid ? "line-clamp-2 text-base" : "text-lg"
            )}
          >
            {item.title}
          </Link>
          <p
            className={cn(
              "text-muted-foreground",
              isGrid ? "mt-1 line-clamp-1 text-xs" : "mt-1 text-sm"
            )}
          >
            {item.campaignName}
          </p>
          <p
            className={cn(
              "text-muted-foreground",
              isGrid ? "mt-1 line-clamp-2 text-[11px] leading-snug" : "mt-1 text-xs"
            )}
          >
            Approved by {item.approvedBy} ·{" "}
            {new Date(item.approvedAt).toLocaleDateString()}
          </p>
        </div>

        {item.type === "graphic" ? (
          <GraphicPreview
            content={item.content}
            title={item.title}
            className={cn(
              "overflow-hidden rounded-xl border border-border/60 [&_svg]:h-auto [&_svg]:w-full",
              isGrid ? "mt-auto aspect-[16/10]" : "mt-3 max-w-md"
            )}
          />
        ) : (
          <p
            className={cn(
              "text-foreground/80",
              isGrid
                ? "mt-auto line-clamp-4 text-xs leading-relaxed"
                : "mt-3 line-clamp-3 text-sm"
            )}
          >
            {item.content}
          </p>
        )}
      </div>

      <div className={cn(isGrid ? "mt-1" : "shrink-0")}>
        <LibraryActions item={item} />
      </div>
    </article>
  )
}
