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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[team]", error.message)
      setMembers([])
      setReady(true)
      return
    }

    setMembers((data ?? []).map(profileToMember))
    setReady(true)
  }, [])

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
      if (!email || !email.includes("@")) return { error: "Valid email is required." }
      if (members.some((m) => normalizeEmail(m.email) === email)) {
        return { error: "A member with that email already exists." }
      }

      // Invites require the person to register; store a placeholder note via upsert is not possible
      // without auth.users. Surface clear instruction instead of fake local rows.
      return {
        error:
          "Ask them to register with this email and role. Profiles appear here after signup.",
      }
    },
    [members]
  )

  const setMemberStatus = useCallback(
    async (id: string, status: TeamMemberStatus) => {
      const supabase = createClient()
      await supabase.from("profiles").update({ status }).eq("id", id)
      await loadMembers()
    },
    [loadMembers]
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
