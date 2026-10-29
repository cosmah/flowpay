"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, LayoutList } from "lucide-react"
import { LibraryItemCard } from "@/components/library/library-item-card"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { Button } from "@/components/ui/button"
import { useLibrary } from "@/hooks/use-library"
import type { LibraryItemType } from "@/types"
import { cn } from "@/lib/utils"

const EMPTY_MESSAGE =
  "No approved materials yet. Approve a draft to see it here."

type SortKey =
  | "approved_desc"
  | "approved_asc"
  | "title_asc"
  | "title_desc"
  | "campaign"
  | "type"

type ViewMode = "list" | "grid"

export function LibraryList() {
  const { items } = useLibrary()
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | LibraryItemType>("all")
  const [campaignFilter, setCampaignFilter] = useState("all")
  const [sort, setSort] = useState<SortKey>("approved_desc")
  const [view, setView] = useState<ViewMode>("list")

  const campaigns = useMemo(() => {
    const names = new Set(items.map((item) => item.campaignName))
    return Array.from(names).sort()
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = items.filter((item) => {
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

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "title_asc":
          return a.title.localeCompare(b.title)
        case "title_desc":
          return b.title.localeCompare(a.title)
        case "campaign":
          return a.campaignName.localeCompare(b.campaignName)
        case "type":
          return a.type.localeCompare(b.type)
        case "approved_asc":
          return (
            new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime()
          )
        case "approved_desc":
        default:
          return (
            new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime()
          )
      }
    })

    return rows
  }, [items, query, typeFilter, campaignFilter, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <ListToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search title, content, or campaign…"
            searchLabel="Search library"
            filters={
              <>
                <select
                  aria-label="Filter by type"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as "all" | LibraryItemType)
                  }
                  className={listControlClassName}
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
                  className={listControlClassName}
                >
                  <option value="all">All campaigns</option>
                  {campaigns.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            }
            sort={
              <select
                aria-label="Sort library"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={listControlClassName}
              >
                <option value="approved_desc">Newest approved</option>
                <option value="approved_asc">Oldest approved</option>
                <option value="title_asc">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
                <option value="campaign">Campaign</option>
                <option value="type">Type</option>
              </select>
            }
          />
        </div>

        <div
          className="inline-flex shrink-0 self-end rounded-lg border border-border/70 bg-[var(--rx-paper)] p-1 lg:self-auto"
          role="group"
          aria-label="Library view"
        >
          <Button
            type="button"
            size="sm"
            variant={view === "list" ? "secondary" : "ghost"}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className="gap-1.5"
          >
            <LayoutList />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "grid" ? "secondary" : "ghost"}
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            className="gap-1.5"
          >
            <LayoutGrid />
            <span className="hidden sm:inline">Grid</span>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={EMPTY_MESSAGE}
          description="Try clearing search or filters if you expected an item here."
        />
      ) : (
        <ul
          className={cn(
            view === "list"
              ? "flex flex-col gap-3"
              : // 1 → 2 → 3 → 4 → 5 columns; desktop (xl+) holds five tiles across
                "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          )}
        >
          {filtered.map((item) => (
            <li key={item.id} className="min-w-0">
              <LibraryItemCard item={item} layout={view} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
