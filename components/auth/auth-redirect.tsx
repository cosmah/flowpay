"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ROUTES } from "@/lib/constants/routes"
import { LoadingState } from "@/components/shared"

/**
 * If a session already exists on /login or /register, send the user to dashboard.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()

  useEffect(() => {
    if (isReady && isAuthenticated) {
      window.location.replace(ROUTES.dashboard)
    }
  }, [isAuthenticated, isReady])

  if (!isReady || isAuthenticated) {
    return (
      <div className="w-full max-w-md">
        <LoadingState variant="form" label="Redirecting to dashboard" />
      </div>
    )
  }

  return children
}
