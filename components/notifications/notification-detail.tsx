"use client"

import Link from "next/link"
import { useEffect } from "react"
import {
  ArrowLeft,
  Bell,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Library,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { useNotifications } from "@/hooks/use-notifications"
import { ROUTES } from "@/lib/constants/routes"
import type { NotificationKind } from "@/types"

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

export function NotificationDetail({ id }: { id: string }) {
  const { getNotification, markRead } = useNotifications()
  const item = getNotification(id)

  useEffect(() => {
    if (item && !item.readAt) markRead(item.id)
  }, [item, markRead])

  if (!item) {
    return (
      <EmptyState
        title="Notification not found"
        description="It may have been cleared from this browser session."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.notifications}>Back to notifications</Link>
          </Button>
        }
      />
    )
  }

  const meta = KIND_META[item.kind]
  const Icon = meta.icon

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={ROUTES.notifications}>
          <ArrowLeft />
          All notifications
        </Link>
      </Button>

      <article className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
        <header className="border-b border-border/60 bg-muted/30 px-5 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--rx-ink)] text-[var(--rx-paper)]">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {meta.label}
              </p>
              <h2 className="mt-1 font-heading text-2xl text-[var(--rx-ink)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
                {item.readAt
                  ? ` · Read ${new Date(item.readAt).toLocaleString()}`
                  : " · Unread"}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-5 py-6 sm:px-8">
          <p className="text-base leading-relaxed text-foreground">{item.body}</p>

          {item.href ? (
            <Button asChild>
              <Link href={item.href}>
                Open related page
                <ExternalLink />
              </Link>
            </Button>
          ) : null}
        </div>
      </article>
    </div>
  )
}
