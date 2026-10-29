"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Bell,
  BookOpen,
  CheckCheck,
  ClipboardList,
  Library,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ListToolbar,
  listControlClassName,
} from "@/components/shared/list-toolbar"
import { useNotifications } from "@/hooks/use-notifications"
import { ROUTES } from "@/lib/constants/routes"
import type { NotificationKind } from "@/types"
import { cn } from "@/lib/utils"

const KIND_META: Record<
  NotificationKind,
  { label: string; icon: typeof Bell }
> = {
  task: { label: "Tasks", icon: ClipboardList },
  review: { label: "Review", icon: BookOpen },
  library: { label: "Library", icon: Library },
  team: { label: "Team", icon: Users },
  system: { label: "System", icon: Bell },
}

export function NotificationsList() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications()
  const [query, setQuery] = useState("")
  const [kindFilter, setKindFilter] = useState<"all" | NotificationKind>("all")
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...notifications]
      .filter((item) => {
        if (kindFilter !== "all" && item.kind !== kindFilter) return false
        if (readFilter === "unread" && item.readAt) return false
        if (readFilter === "read" && !item.readAt) return false
        if (!needle) return true
        return `${item.title} ${item.summary} ${item.body}`
          .toLowerCase()
          .includes(needle)
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [notifications, query, kindFilter, readFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unreadCount === 0
            ? "No unread notifications"
            : `${unreadCount} unread`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() => markAllRead()}
        >
          <CheckCheck />
          Mark all read
        </Button>
      </div>

      <ListToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search notifications…"
        searchLabel="Search notifications"
        filters={
          <>
            <select
              aria-label="Filter by type"
              value={kindFilter}
              onChange={(e) =>
                setKindFilter(e.target.value as "all" | NotificationKind)
              }
              className={listControlClassName}
            >
              <option value="all">All types</option>
              {(Object.keys(KIND_META) as NotificationKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_META[kind].label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by read state"
              value={readFilter}
              onChange={(e) =>
                setReadFilter(e.target.value as "all" | "unread" | "read")
              }
              className={listControlClassName}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications match"
          description="Try clearing search or filters."
        />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
          {filtered.map((item) => {
            const meta = KIND_META[item.kind]
            const Icon = meta.icon
            const unread = !item.readAt
            return (
              <li key={item.id} className="border-b border-border/60 last:border-0">
                <Link
                  href={ROUTES.notification(item.id)}
                  onClick={() => markRead(item.id)}
                  className={cn(
                    "flex gap-4 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5",
                    unread && "bg-[var(--rx-mist)]/25"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                      unread
                        ? "bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-base text-[var(--rx-ink)]">
                        {item.title}
                      </span>
                      {unread ? (
                        <span className="rounded-full bg-[var(--rx-lagoon)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--rx-ink)]">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.summary}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{meta.label}</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </span>
                  </span>
                  {unread ? (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--rx-lagoon)]" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
