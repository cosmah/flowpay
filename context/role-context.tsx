"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { UserRole } from "@/types"

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  isMarketer: boolean
  isReviewer: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("marketer")

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next)
  }, [])

  const value = useMemo(
    () => ({
      role,
      setRole,
      isMarketer: role === "marketer",
      isReviewer: role === "reviewer",
    }),
    [role, setRole]
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
