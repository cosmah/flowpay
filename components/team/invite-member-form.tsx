"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRole } from "@/hooks/use-role"
import { useTeam } from "@/hooks/use-team"
import { INVITABLE_ROLES, ROLE_LABELS, type UserRole } from "@/types"

export function InviteMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const { canManageTeam } = useRole()
  const { inviteMember } = useTeam()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("marketer")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!canManageTeam) {
    return (
      <p className="text-sm text-muted-foreground">
        Only the company admin can invite teammates.
      </p>
    )
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const result = await inviteMember({ name, email, role })
      if ("error" in result) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      setName("")
      setEmail("")
      setRole("marketer")
      toast.success("Invite sent with a temporary password.")
      onSuccess?.()
    } catch {
      setError("Could not send invite.")
      toast.error("Could not send invite.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-name">Full name</Label>
        <Input
          id="invite-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sam Okello"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-email">Work email</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sam@company.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {INVITABLE_ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          We create their account, assign one role, and email a temporary
          password so they can sign in immediately.
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send invite"}
      </Button>
    </form>
  )
}
