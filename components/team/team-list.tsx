"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Ban, CheckCircle2, Trash2, UserPlus } from "lucide-react"
import { InviteMemberForm } from "@/components/team/invite-member-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDb } from "@/hooks/use-db"
import { useLibrary } from "@/hooks/use-library"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { ROLE_LABELS } from "@/types"
import { cn } from "@/lib/utils"

export function TeamList() {
  const {
    members,
    currentUser,
    setMemberStatus,
    deleteMember,
  } = useTeam()
  const { tasks } = useTasks()
  const { items } = useLibrary()
  const { db } = useDb()
  const [inviteOpen, setInviteOpen] = useState(false)

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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setInviteOpen(true)}>
          <UserPlus />
          Invite member
        </Button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ member, open, overdue, activity }) => {
          const isCurrent = member.id === currentUser.id
          const disabled = member.status === "disabled"
          const activityLabel =
            member.role === "reviewer" ? "Items approved" : "Drafts submitted"

          return (
            <li key={member.id}>
              <div
                className={cn(
                  "flex h-full flex-col gap-4 rounded-2xl border bg-[var(--rx-paper)] px-5 py-5",
                  isCurrent
                    ? "border-[var(--rx-ink)] ring-1 ring-[var(--rx-ink)]/20"
                    : "border-border/70",
                  disabled && "opacity-70"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      disabled
                        ? "bg-muted text-muted-foreground"
                        : "bg-[var(--rx-mist)] text-[var(--rx-ink)]"
                    )}
                  >
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
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                        {ROLE_LABELS[member.role]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          disabled
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
                        )}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-muted/40 px-2 py-3">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Open
                    </dt>
                    <dd className="mt-1 font-heading text-xl tabular-nums">
                      {open}
                    </dd>
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

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.tasksOwner(member.name)}>Tasks</Link>
                  </Button>
                  {disabled ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMemberStatus(member.id, "active")
                        toast.success(`${member.name} enabled.`)
                      }}
                    >
                      <CheckCircle2 />
                      Enable
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isCurrent}
                      onClick={() => {
                        setMemberStatus(member.id, "disabled")
                        toast.message(`${member.name} disabled.`)
                      }}
                    >
                      <Ban />
                      Disable
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isCurrent}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Delete ${member.name} from the team?`
                      )
                      if (!confirmed) return
                      const result = deleteMember(member.id)
                      if ("error" in result) {
                        toast.error(result.error)
                        return
                      }
                      toast.success("Member deleted.")
                    }}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Add a marketer or reviewer to this workspace. They can sign in
              after registering with the same email.
            </DialogDescription>
          </DialogHeader>
          <InviteMemberForm onSuccess={() => setInviteOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
