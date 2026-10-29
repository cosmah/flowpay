"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"
import { ErrorBoundary } from "@/components/shared"
import { Toaster } from "@/components/ui/sonner"

/**
 * Root client providers + a top-level soft error boundary.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary title="FlowPay hit an unexpected error">
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}
