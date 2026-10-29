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
import {
  createSeedMembers,
  DEFAULT_MARKETER_ID,
  DEFAULT_REVIEWER_ID,
} from "@/lib/team/seed"
import type { TeamMember } from "@/types"

const MEMBERS_KEY = "flowpay.team.members.v1"
const SEEDED_KEY = "flowpay.team.seeded.v1"
const CURRENT_USER_KEY = "flowpay.team.currentUserId.v1"

interface TeamContextValue {
  members: TeamMember[]
  currentUser: TeamMember
  setCurrentUser: (id: string) => void
  getMember: (id: string) => TeamMember | undefined
  getReviewer: () => TeamMember
  getMarketers: () => TeamMember[]
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

export function TeamProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => createSeedMembers(), [])
  const [members, setMembers] = useState<TeamMember[]>(seed)
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_MARKETER_ID)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const seeded = window.localStorage.getItem(SEEDED_KEY) === "1"
    const storedMembers = readJson<TeamMember[]>(MEMBERS_KEY)
    const storedUserId = window.localStorage.getItem(CURRENT_USER_KEY)

    if (storedMembers && storedMembers.length > 0) {
      setMembers(storedMembers)
    } else if (!seeded) {
      const next = createSeedMembers()
      setMembers(next)
      window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(next))
      window.localStorage.setItem(SEEDED_KEY, "1")
    }

    const roster = storedMembers && storedMembers.length > 0 ? storedMembers : seed
    const fallback = roster.find((m) => m.id === DEFAULT_MARKETER_ID)?.id ?? roster[0]?.id
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

  const setCurrentUser = useCallback(
    (id: string) => {
      if (!members.some((member) => member.id === id)) return
      setCurrentUserId(id)
    },
    [members]
  )

  const getMember = useCallback(
    (id: string) => members.find((member) => member.id === id),
    [members]
  )

  const getReviewer = useCallback(() => {
    return (
      members.find((member) => member.id === DEFAULT_REVIEWER_ID) ??
      members.find((member) => member.role === "reviewer") ??
      members[0]
    )
  }, [members])

  const getMarketers = useCallback(
    () => members.filter((member) => member.role === "marketer"),
    [members]
  )

  const currentUser =
    members.find((member) => member.id === currentUserId) ??
    members[0] ??
    seed[0]

  const value = useMemo<TeamContextValue>(
    () => ({
      members,
      currentUser,
      setCurrentUser,
      getMember,
      getReviewer,
      getMarketers,
    }),
    [members, currentUser, setCurrentUser, getMember, getReviewer, getMarketers]
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
