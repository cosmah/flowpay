"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useAuth } from "@/hooks/use-auth"
import { useTeam } from "@/context/team-context"
import type { UserRole } from "@/types"

interface RoleContextValue {
  role: UserRole
  isMarketer: boolean
  isReviewer: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

/** Role comes from the signed-in account (fallback: active team member). */
export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { currentUser } = useTeam()

  const role = user?.role ?? currentUser.role

  const value = useMemo(
    () => ({
      role,
      isMarketer: role === "marketer",
      isReviewer: role === "reviewer",
    }),
    [role]
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
