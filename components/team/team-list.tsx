"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useDb } from "@/hooks/use-db"
import { useLibrary } from "@/hooks/use-library"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { ROLE_LABELS } from "@/types"
import { cn } from "@/lib/utils"

export function TeamList() {
  const { members, currentUser } = useTeam()
  const { tasks } = useTasks()
  const { items } = useLibrary()
  const { db } = useDb()

  const rows = useMemo(() => {
    return members.map((member) => {
      const owned = tasks.filter((task) => task.owner === member.name)
      const open = owned.filter((task) => task.status !== "done").length
      const overdue = owned.filter((task) => task.isOverdue).length
      const activity =
        member.role === "reviewer"
          ? items.filter((item) => item.approvedBy === member.name).length
          : db.drafts.filter((draft) => draft.authorName === member.name).length

      return { member, open, overdue, activity }
    })
  }, [members, tasks, items, db.drafts])

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(({ member, open, overdue, activity }) => {
        const isCurrent = member.id === currentUser.id
        const activityLabel =
          member.role === "reviewer" ? "Items approved" : "Drafts submitted"

        return (
          <li key={member.id}>
            <Link
              href={ROUTES.tasksOwner(member.name)}
              className={cn(
                "flex h-full flex-col gap-4 rounded-2xl border bg-[var(--rx-paper)] px-5 py-5 transition-colors hover:border-[var(--rx-lagoon)]/50",
                isCurrent
                  ? "border-[var(--rx-ink)] ring-1 ring-[var(--rx-ink)]/20"
                  : "border-border/70"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--rx-mist)] text-sm font-semibold text-[var(--rx-ink)]">
                  {member.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-lg text-[var(--rx-ink)]">
                    {member.name}
                    {isCurrent ? (
                      <span className="ml-2 text-xs font-medium text-[var(--rx-lagoon)]">
                        You
                      </span>
                    ) : null}
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-muted/40 px-2 py-3">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Open
                  </dt>
                  <dd className="mt-1 font-heading text-xl tabular-nums">{open}</dd>
                </div>
                <div className="rounded-xl bg-muted/40 px-2 py-3">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Overdue
                  </dt>
                  <dd className="mt-1 font-heading text-xl tabular-nums text-destructive">
                    {overdue}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted/40 px-2 py-3">
                  <dt className="line-clamp-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {activityLabel}
                  </dt>
                  <dd className="mt-1 font-heading text-xl tabular-nums">
                    {activity}
                  </dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                View tasks owned by {member.name.split(" ")[0]} →
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
