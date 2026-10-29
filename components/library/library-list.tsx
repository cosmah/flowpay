"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ApprovedBadge } from "@/components/library/approved-badge"
import { GraphicPreview } from "@/components/library/graphic-preview"
import { LibraryActions } from "@/components/library/library-actions"
import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/ui/input"
import { useLibrary } from "@/hooks/use-library"
import { ROUTES } from "@/lib/constants/routes"
import type { LibraryItemType } from "@/types"

const EMPTY_MESSAGE =
  "No approved materials yet. Approve a draft to see it here."

export function LibraryList() {
  const { items } = useLibrary()
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | LibraryItemType>("all")
  const [campaignFilter, setCampaignFilter] = useState("all")

  const campaigns = useMemo(() => {
    const names = new Set(items.map((item) => item.campaignName))
    return Array.from(names).sort()
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false
      if (campaignFilter !== "all" && item.campaignName !== campaignFilter) {
        return false
      }
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.campaignName.toLowerCase().includes(q)
      )
    })
  }, [items, query, typeFilter, campaignFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, content, or campaign"
          className="sm:max-w-sm"
          aria-label="Search library"
        />
        <select
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | LibraryItemType)
          }
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All types</option>
          <option value="caption">Caption</option>
          <option value="email">Email</option>
          <option value="graphic">Graphic</option>
        </select>
        <select
          aria-label="Filter by campaign"
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All campaigns</option>
          {campaigns.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={EMPTY_MESSAGE}
          description="Try clearing search or filters if you expected an item here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.type}
                </span>
                <ApprovedBadge />
              </div>
              <div>
                <Link
                  href={ROUTES.libraryItem(item.id)}
                  className="font-heading text-lg text-[var(--rx-ink)] hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.campaignName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Approved by {item.approvedBy} ·{" "}
                  {new Date(item.approvedAt).toLocaleDateString()}
                </p>
              </div>
              {item.type === "graphic" ? (
                <GraphicPreview
                  content={item.content}
                  title={item.title}
                  className="overflow-hidden rounded-xl border border-border/60 [&_svg]:h-auto [&_svg]:w-full"
                />
              ) : (
                <p className="line-clamp-3 text-sm text-foreground/80">
                  {item.content}
                </p>
              )}
              <LibraryActions item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
