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
  isAdmin: boolean
  isMarketer: boolean
  isReviewer: boolean
  /** Admin has global access within the company. */
  canManageTeam: boolean
  canReview: boolean
  canMarket: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role: UserRole = user?.role ?? "marketer"

  const value = useMemo(() => {
    const isAdmin = role === "admin"
    return {
      role,
      isAdmin,
      isMarketer: role === "marketer" || isAdmin,
      isReviewer: role === "reviewer" || isAdmin,
      canManageTeam: isAdmin,
      canReview: role === "reviewer" || isAdmin,
      canMarket: role === "marketer" || isAdmin,
    }
  }, [role])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider")
  }
  return ctx
}
