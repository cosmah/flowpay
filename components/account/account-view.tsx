"use client"

import Link from "next/link"
import {
  BadgeCheck,
  Briefcase,
  CircleUserRound,
  LayoutList,
  LogOut,
  Mail,
  Shield,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { ROLE_LABELS } from "@/types"

export function AccountView() {
  const { user, logout, isAuthenticated } = useAuth()
  const { currentUser, members } = useTeam()
  const { tasks } = useTasks()

  const openTasks = tasks.filter(
    (task) => task.owner === currentUser.name && task.status !== "done"
  ).length
  const overdueTasks = tasks.filter(
    (task) => task.owner === currentUser.name && task.isOverdue
  ).length

  function onLogout() {
    logout()
    window.location.assign(ROUTES.login)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-6 py-10 text-center">
        <p className="font-heading text-xl text-[var(--rx-ink)]">Sign in required</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Every workspace user must log in. Demo switching has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href={ROUTES.login}>Log in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
        <div className="border-b border-border/60 bg-[var(--rx-mist)]/40 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--rx-ink)] text-lg font-semibold text-[var(--rx-paper)] shadow-md ring-2 ring-[var(--rx-lagoon)]/40">
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-2xl text-[var(--rx-ink)]">
                {user.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="size-3.5" />
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
              </p>
            </div>
            <Button type="button" variant="destructive" onClick={onLogout}>
              <LogOut />
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
          <StatCard icon={LayoutList} label="Open tasks" value={String(openTasks)} />
          <StatCard icon={BadgeCheck} label="Overdue" value={String(overdueTasks)} />
          <StatCard icon={Users} label="Team size" value={String(members.length)} />
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <CircleUserRound className="size-4 text-muted-foreground" />
          <h2 className="font-heading text-lg text-[var(--rx-ink)]">
            Profile details
          </h2>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail icon={Briefcase} label="Role" value={ROLE_LABELS[user.role]} />
          <Detail icon={Users} label="Display name" value={user.name} />
          <Detail icon={Mail} label="Email" value={user.email} />
          <Detail
            icon={Shield}
            label="Member status"
            value={currentUser.status}
          />
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={ROUTES.team}>Manage team</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.notifications}>Notifications</Link>
        </Button>
        <Button type="button" variant="destructive" onClick={onLogout}>
          <LogOut />
          Log out
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutList
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 font-heading text-2xl tabular-nums text-[var(--rx-ink)]">
        {value}
      </p>
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/60 px-4 py-3">
      <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-medium capitalize text-foreground">
        {value}
      </dd>
    </div>
  )
}
