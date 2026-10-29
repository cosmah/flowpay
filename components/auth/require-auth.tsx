"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ROUTES } from "@/lib/constants/routes"
import { LoadingState } from "@/components/shared"

/**
 * Workspace gate — every user must sign in; demo switching is not available.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      window.location.replace(ROUTES.login)
    }
  }, [isAuthenticated, isReady])

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <LoadingState variant="page" label="Checking session" />
      </div>
    )
  }

  return children
}
