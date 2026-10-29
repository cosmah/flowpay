"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import type { TeamMember, TeamMemberStatus, UserRole } from "@/types"
import { initialsFromName } from "@/types"

type InviteInput = {
  name: string
  email: string
  role: UserRole
}

interface TeamContextValue {
  members: TeamMember[]
  currentUser: TeamMember
  getMember: (id: string) => TeamMember | undefined
  getReviewer: () => TeamMember
  getMarketers: () => TeamMember[]
  inviteMember: (input: InviteInput) => Promise<TeamMember | { error: string }>
  setMemberStatus: (id: string, status: TeamMemberStatus) => Promise<void>
  deleteMember: (id: string) => Promise<{ ok: true } | { error: string }>
  ready: boolean
}

const TeamContext = createContext<TeamContextValue | null>(null)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function profileToMember(row: {
  id: string
  name: string
  email: string
  role: UserRole
  status: TeamMemberStatus
}): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: normalizeEmail(row.email),
    role: row.role,
    initials: initialsFromName(row.name),
    status: row.status,
  }
}

const fallbackMember: TeamMember = {
  id: "anonymous",
  name: "Guest",
  email: "guest@flowpay.dev",
  role: "marketer",
  initials: "G",
  status: "active",
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [ready, setReady] = useState(false)

  const loadMembers = useCallback(async () => {
    const supabase = createClient()
    if (!user?.companyId) {
      setMembers([])
      setReady(true)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", user.companyId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[team]", error.message)
      setMembers([])
      setReady(true)
      return
    }

    setMembers((data ?? []).map(profileToMember))
    setReady(true)
  }, [user?.companyId])

  useEffect(() => {
    if (!authReady) return
    void loadMembers()
  }, [authReady, loadMembers, user?.id])

  const currentUser = useMemo(() => {
    if (user) {
      const matched = members.find(
        (member) => normalizeEmail(member.email) === normalizeEmail(user.email)
      )
      if (matched) return matched
      return {
        id: user.id,
        name: user.name,
        email: normalizeEmail(user.email),
        role: user.role,
        initials: initialsFromName(user.name),
        status: "active" as const,
      }
    }
    return members.find((m) => m.status === "active") ?? members[0] ?? fallbackMember
  }, [members, user])

  const getMember = useCallback(
    (id: string) => members.find((member) => member.id === id),
    [members]
  )

  const getReviewer = useCallback(() => {
    return (
      members.find(
        (member) => member.role === "reviewer" && member.status === "active"
      ) ??
      members.find((member) => member.status === "active") ??
      currentUser
    )
  }, [members, currentUser])

  const getMarketers = useCallback(
    () =>
      members.filter(
        (member) => member.role === "marketer" && member.status === "active"
      ),
    [members]
  )

  const inviteMember = useCallback(
    async (input: InviteInput) => {
      const email = normalizeEmail(input.email)
      const name = input.name.trim()
      if (!name) return { error: "Name is required." }
      if (!email || !email.includes("@")) {
        return { error: "Valid email is required." }
      }
      if (!["admin", "marketer", "reviewer"].includes(input.role)) {
        return { error: "Choose a single role: admin, marketer, or reviewer." }
      }
      if (members.some((m) => normalizeEmail(m.email) === email)) {
        return { error: "A member with that email already exists." }
      }

      try {
        const response = await fetch("/api/team/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            role: input.role,
          }),
        })
        const payload = (await response.json()) as {
          ok?: boolean
          error?: string
          fields?: Record<string, string>
          member?: {
            id: string
            name: string
            email: string
            role: UserRole
            status: TeamMemberStatus
          }
        }

        if (!response.ok || !payload.ok) {
          return {
            error:
              payload.fields?.email ??
              payload.fields?.name ??
              payload.fields?.role ??
              payload.error ??
              "Could not send invite.",
          }
        }

        await loadMembers()
        if (payload.member) {
          return profileToMember(payload.member)
        }
        return { error: "Invite sent, but member profile was not returned." }
      } catch {
        return { error: "Could not send invite." }
      }
    },
    [loadMembers, members]
  )

  const setMemberStatus = useCallback(
    async (id: string, status: TeamMemberStatus) => {
      if (!user?.companyId) return
      if (!members.some((member) => member.id === id)) return
      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({ status })
        .eq("id", id)
        .eq("company_id", user.companyId)
      await loadMembers()
    },
    [loadMembers, members, user?.companyId]
  )

  const deleteMember = useCallback(
    async (id: string) => {
      if (id === currentUser.id) {
        return { error: "You cannot delete the signed-in member." }
      }
      // Hard-delete of auth users needs service role; disable instead.
      await setMemberStatus(id, "disabled")
      return { ok: true as const }
    },
    [currentUser.id, setMemberStatus]
  )

  const value = useMemo(
    () => ({
      members,
      currentUser,
      getMember,
      getReviewer,
      getMarketers,
      inviteMember,
      setMemberStatus,
      deleteMember,
      ready,
    }),
    [
      members,
      currentUser,
      getMember,
      getReviewer,
      getMarketers,
      inviteMember,
      setMemberStatus,
      deleteMember,
      ready,
    ]
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) {
    throw new Error("useTeam must be used within TeamProvider")
  }
  return ctx
}
