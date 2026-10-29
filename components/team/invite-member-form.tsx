"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRole } from "@/hooks/use-role"
import type { UserRole } from "@/types"

export function InviteMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const { canManageTeam } = useRole()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("marketer")
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
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      })
      const payload = (await response.json()) as {
        ok?: boolean
        error?: string
        fields?: Record<string, string>
      }

      if (!response.ok || !payload.ok) {
        const message = payload.error ?? "Could not send invite."
        setError(payload.fields?.email ?? message)
        toast.error(message)
        setSubmitting(false)
        return
      }

      setEmail("")
      setRole("marketer")
      toast.success("Invite email sent.")
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
        <Label htmlFor="invite-email">Work email</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sam@company.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as Exclude<UserRole, "admin">)
          }
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="marketer">Marketer</option>
          <option value="reviewer">Reviewer</option>
        </select>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Invites stay inside your company. The teammate verifies email, then
          joins with the selected role.
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send invite"}
      </Button>
    </form>
  )
}
