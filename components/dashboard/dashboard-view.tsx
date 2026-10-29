"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared"
import { useAuth } from "@/hooks/use-auth"
import { useDb } from "@/hooks/use-db"
import { useLibrary } from "@/hooks/use-library"
import { useRole } from "@/hooks/use-role"
import { useTasks } from "@/hooks/use-tasks"
import { ROUTES } from "@/lib/constants/routes"

export function DashboardView() {
  const { user, isReady } = useAuth()
  const { role } = useRole()
  const { db } = useDb()
  const { tasks } = useTasks()
  const { items: libraryItems } = useLibrary()
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    // Short skeleton beat so route transitions feel consistent with LoadingState.
    const timer = window.setTimeout(() => setBooting(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const stats = useMemo(() => {
    const openTasks = tasks.filter(
      (task) => task.status === "todo" || task.status === "in_progress"
    ).length
    const inReview = db.drafts.filter((draft) => draft.status === "in_review").length
    const changesRequested = db.drafts.filter(
      (draft) => draft.status === "changes_requested"
    ).length

    return [
      {
        label: "Campaigns",
        value: db.campaigns.length,
        hint: "Active briefs",
        href: ROUTES.campaigns,
      },
      {
        label: "Open tasks",
        value: openTasks,
        hint: "Owner · due · status",
        href: ROUTES.tasks,
      },
      {
        label: role === "marketer" ? "Needs edits" : "In review",
        value: role === "marketer" ? changesRequested : inReview,
        hint: role === "marketer" ? "Changes requested" : "Pending decisions",
        href: role === "marketer" ? ROUTES.campaigns : ROUTES.review,
      },
      {
        label: "Library",
        value: libraryItems.length,
        hint: "Approved only",
        href: ROUTES.library,
      },
    ]
  }, [db, role, tasks, libraryItems.length])

  const recentCampaigns = useMemo(
    () =>
      [...db.campaigns]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 4),
    [db.campaigns]
  )

  const attentionItems = useMemo(() => {
    if (role === "reviewer") {
      return db.drafts
        .filter((draft) => draft.status === "in_review")
        .slice(0, 5)
        .map((draft) => ({
          id: draft.id,
          title: `${draft.format} draft`,
          meta: draft.campaignId,
          status: draft.status,
          href: ROUTES.review,
        }))
    }

    return tasks
      .filter((task) => task.status !== "done")
      .slice(0, 5)
      .map((task) => ({
        id: task.id,
        title: task.title,
        meta: `Due ${new Date(task.dueDate).toLocaleDateString()}`,
        status: task.status,
        href: ROUTES.tasks,
      }))
  }, [db.drafts, tasks, role])

  if (!isReady || booting) {
    return <DashboardSkeleton />
  }

  const firstName = user?.name?.split(" ")[0] ?? "there"

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Track briefs, reviews, and approved assets from one FlowPay dashboard."
        actions={
          role === "marketer" ? (
            <Button asChild>
              <Link href={ROUTES.campaignNew}>New campaign</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={ROUTES.review}>Open review queue</Link>
            </Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-4 transition-colors hover:border-[var(--rx-lagoon)]/40 hover:bg-muted/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-3 font-heading text-3xl tracking-tight text-[var(--rx-ink)]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg text-[var(--rx-ink)]">
              Recent campaigns
            </h2>
            <Link
              href={ROUTES.campaigns}
              className="text-xs font-medium text-[var(--rx-lagoon)] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {recentCampaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={ROUTES.campaign(campaign.id)}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--rx-ink)]">
                      {campaign.brief.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={campaign.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg text-[var(--rx-ink)]">
              {role === "reviewer" ? "Needs your review" : "Tasks needing attention"}
            </h2>
            <Link
              href={role === "reviewer" ? ROUTES.review : ROUTES.tasks}
              className="text-xs font-medium text-[var(--rx-lagoon)] hover:underline"
            >
              View all
            </Link>
          </div>
          {attentionItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-5 py-8 text-sm text-muted-foreground">
              Nothing waiting right now. You’re caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
              {attentionItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium capitalize text-[var(--rx-ink)]">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
