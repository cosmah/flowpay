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
  const { user, logout } = useAuth()
  const { currentUser, members, setCurrentUser } = useTeam()
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
        <div className="border-b border-border/60 bg-[var(--rx-mist)]/40 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--rx-ink)] text-lg font-semibold text-[var(--rx-paper)]">
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-2xl text-[var(--rx-ink)]">
                {currentUser.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="size-3.5" />
                  {ROLE_LABELS[currentUser.role]}
                </span>
                {user?.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {user.email}
                  </span>
                ) : null}
              </p>
            </div>
            <Button type="button" variant="destructive" onClick={onLogout}>
              <LogOut />
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
          <StatCard
            icon={LayoutList}
            label="Open tasks"
            value={String(openTasks)}
          />
          <StatCard
            icon={BadgeCheck}
            label="Overdue"
            value={String(overdueTasks)}
          />
          <StatCard
            icon={Users}
            label="Team size"
            value={String(members.length)}
          />
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
          <Detail icon={Briefcase} label="Demo role" value={ROLE_LABELS[currentUser.role]} />
          <Detail icon={Users} label="Workspace identity" value={currentUser.name} />
          <Detail
            icon={Mail}
            label="Signed-in email"
            value={user?.email ?? "Not signed in"}
          />
          <Detail
            icon={Shield}
            label="Session role"
            value={user?.role ? ROLE_LABELS[user.role] : "Guest session"}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="font-heading text-lg text-[var(--rx-ink)]">
              Switch demo user
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.team}>Team screen</Link>
          </Button>
        </div>
        <ul className="grid gap-2 sm:grid-cols-3">
          {members.map((member) => {
            const active = member.id === currentUser.id
            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => setCurrentUser(member.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                    active
                      ? "border-[var(--rx-ink)] bg-[var(--rx-mist)]/50"
                      : "border-border/70 hover:bg-muted/40"
                  }`}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-[var(--rx-mist)] text-xs font-semibold">
                    {member.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {member.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={ROUTES.tasks}>My tasks</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.taskBoard}>Task board</Link>
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
      <dd className="mt-1.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
