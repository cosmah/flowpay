"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"
import { ErrorBoundary } from "@/components/shared"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Root client providers + a top-level soft error boundary.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary title="FlowPay hit an unexpected error">
      <TooltipProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
