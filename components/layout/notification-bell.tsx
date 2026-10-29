"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { ROUTES } from "@/lib/constants/routes"

export function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications()
  const preview = [...notifications]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-11 rounded-full border-border/70 bg-[var(--rx-paper)] shadow-sm"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          <Link
            href={ROUTES.notifications}
            className="text-xs font-normal text-[var(--rx-lagoon)] hover:underline"
          >
            View all
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {preview.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </div>
        ) : (
          preview.map((item) => (
            <DropdownMenuItem key={item.id} asChild className="cursor-pointer">
              <Link
                href={ROUTES.notification(item.id)}
                onClick={() => markRead(item.id)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="flex w-full items-center gap-2">
                  {!item.readAt ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-[var(--rx-lagoon)]" />
                  ) : (
                    <span className="size-1.5 shrink-0" />
                  )}
                  <span className="truncate text-sm font-medium">
                    {item.title}
                  </span>
                </span>
                <span className="line-clamp-2 pl-3.5 text-xs text-muted-foreground">
                  {item.summary}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.notifications} className="justify-center text-sm">
            Open notification center
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
