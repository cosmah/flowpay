"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/types"

interface RoleContextValue {
  role: UserRole
  isMarketer: boolean
  isReviewer: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

/** Role comes only from the signed-in account (no TeamProvider coupling). */
export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role: UserRole = user?.role ?? "marketer"

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
