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
import {
  createSeedMembers,
  DEFAULT_MARKETER_ID,
  DEFAULT_REVIEWER_ID,
} from "@/lib/team/seed"
import type { PublicUser, TeamMember, TeamMemberStatus, UserRole } from "@/types"
import { initialsFromName } from "@/types"

const MEMBERS_KEY = "flowpay.team.members.v2"
const SEEDED_KEY = "flowpay.team.seeded.v2"
const CURRENT_USER_KEY = "flowpay.team.currentUserId.v2"

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
  inviteMember: (input: InviteInput) => TeamMember | { error: string }
  setMemberStatus: (id: string, status: TeamMemberStatus) => void
  deleteMember: (id: string) => { ok: true } | { error: string }
  ready: boolean
}

const TeamContext = createContext<TeamContextValue | null>(null)

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function memberFromAuth(user: PublicUser): TeamMember {
  return {
    id: `member_${user.id}`,
    name: user.name,
    email: normalizeEmail(user.email),
    role: user.role,
    initials: initialsFromName(user.name),
    status: "active",
  }
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth()
  const seed = useMemo(() => createSeedMembers(), [])
  const [members, setMembers] = useState<TeamMember[]>(seed)
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_MARKETER_ID)
  const [ready, setReady] = useState(false)

  const persistMembers = useCallback((next: TeamMember[]) => {
    setMembers(next)
    window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(next))
  }, [])

  useEffect(() => {
    const seeded = window.localStorage.getItem(SEEDED_KEY) === "1"
    const storedMembers = readJson<TeamMember[]>(MEMBERS_KEY)
    const storedUserId = window.localStorage.getItem(CURRENT_USER_KEY)

    let roster = seed
    if (storedMembers && storedMembers.length > 0) {
      roster = storedMembers.map((m) => ({
        ...m,
        status: m.status ?? "active",
        email: m.email ?? `${m.id}@flowpay.dev`,
      }))
      setMembers(roster)
    } else if (!seeded) {
      roster = createSeedMembers()
      setMembers(roster)
      window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(roster))
      window.localStorage.setItem(SEEDED_KEY, "1")
    }

    const fallback =
      roster.find((m) => m.id === DEFAULT_MARKETER_ID)?.id ?? roster[0]?.id
    const nextId =
      storedUserId && roster.some((m) => m.id === storedUserId)
        ? storedUserId
        : fallback
    if (nextId) setCurrentUserId(nextId)
    setReady(true)
  }, [seed])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(CURRENT_USER_KEY, currentUserId)
  }, [currentUserId, ready])

  // Logged-in session owns the workspace identity (no demo switcher).
  useEffect(() => {
    if (!ready || !authReady || !user) return

    const email = normalizeEmail(user.email)
    setMembers((prev) => {
      const existing = prev.find((m) => normalizeEmail(m.email) === email)
      let next = prev
      let memberId: string

      if (existing) {
        memberId = existing.id
        if (
          existing.name !== user.name ||
          existing.role !== user.role ||
          existing.status === "disabled"
        ) {
          next = prev.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  name: user.name,
                  role: user.role,
                  initials: initialsFromName(user.name),
                  status: "active" as const,
                }
              : m
          )
          window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(next))
        }
      } else {
        const created = memberFromAuth(user)
        memberId = created.id
        next = [created, ...prev]
        window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(next))
      }

      setCurrentUserId(memberId)
      return next
    })
  }, [ready, authReady, user])

  const getMember = useCallback(
    (id: string) => members.find((member) => member.id === id),
    [members]
  )

  const getReviewer = useCallback(() => {
    return (
      members.find(
        (member) =>
          member.id === DEFAULT_REVIEWER_ID && member.status === "active"
      ) ??
      members.find(
        (member) => member.role === "reviewer" && member.status === "active"
      ) ??
      members.find((member) => member.status === "active") ??
      members[0]
    )
  }, [members])

  const getMarketers = useCallback(
    () =>
      members.filter(
        (member) => member.role === "marketer" && member.status === "active"
      ),
    [members]
  )

  const inviteMember = useCallback(
    (input: InviteInput) => {
      const email = normalizeEmail(input.email)
      const name = input.name.trim()
      if (!name) return { error: "Name is required." }
      if (!email || !email.includes("@")) return { error: "Valid email is required." }
      if (members.some((m) => normalizeEmail(m.email) === email)) {
        return { error: "A member with that email already exists." }
      }

      const member: TeamMember = {
        id: `member_${crypto.randomUUID().slice(0, 8)}`,
        name,
        email,
        role: input.role,
        initials: initialsFromName(name),
        status: "active",
      }
      persistMembers([member, ...members])
      return member
    },
    [members, persistMembers]
  )

  const setMemberStatus = useCallback(
    (id: string, status: TeamMemberStatus) => {
      const next = members.map((m) => (m.id === id ? { ...m, status } : m))
      persistMembers(next)
      if (status === "disabled" && id === currentUserId) {
        const fallback = next.find((m) => m.status === "active")
        if (fallback) setCurrentUserId(fallback.id)
      }
    },
    [members, persistMembers, currentUserId]
  )

  const deleteMember = useCallback(
    (id: string) => {
      if (id === currentUserId) {
        return { error: "You cannot delete the signed-in member." }
      }
      const next = members.filter((m) => m.id !== id)
      if (next.length === members.length) {
        return { error: "Member not found." }
      }
      persistMembers(next)
      return { ok: true as const }
    },
    [members, persistMembers, currentUserId]
  )

  const currentUser =
    members.find((member) => member.id === currentUserId) ??
    members.find((m) => m.status === "active") ??
    members[0] ??
    seed[0]

  const value = useMemo<TeamContextValue>(
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
