"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTeam } from "@/hooks/use-team"
import type { UserRole } from "@/types"

export function InviteMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const { inviteMember } = useTeam()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("marketer")
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const missing: string[] = []
    if (!name.trim()) missing.push("name")
    if (!email.trim()) missing.push("email")
    if (missing.length > 0) {
      setError(`Missing ${missing.join(", ")}.`)
      return
    }

    void inviteMember({ name, email, role }).then((result) => {
      if ("error" in result) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      setName("")
      setEmail("")
      setRole("marketer")
      setError(null)
      toast.success(`${result.name} is on the team.`)
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-name">Full name</Label>
        <Input
          id="invite-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sam Adeyemi"
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
          <option value="marketer">Marketer</option>
          <option value="reviewer">Reviewer</option>
        </select>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">Add teammate note</Button>
      <p className="text-xs text-muted-foreground">
        Teammates appear here after they register with Supabase Auth using this
        email and role.
      </p>
    </form>
  )
}
