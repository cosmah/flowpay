"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useTeam } from "@/context/team-context"
import type { UserRole } from "@/types"

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  isMarketer: boolean
  isReviewer: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

/** Role mirrors the active team member; switching role picks the first member with that role. */
export function RoleProvider({ children }: { children: ReactNode }) {
  const { members, currentUser, setCurrentUser } = useTeam()

  const setRole = useCallback(
    (next: UserRole) => {
      if (currentUser.role === next) return
      const match = members.find((member) => member.role === next)
      if (match) setCurrentUser(match.id)
    },
    [members, currentUser.role, setCurrentUser]
  )

  const value = useMemo(
    () => ({
      role: currentUser.role,
      setRole,
      isMarketer: currentUser.role === "marketer",
      isReviewer: currentUser.role === "reviewer",
    }),
    [currentUser.role, setRole]
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider")
  }
  return ctx
}
