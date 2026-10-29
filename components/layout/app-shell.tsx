"use client"

import type { ReactNode } from "react"
import { DbProvider } from "@/context/db-context"
import { RoleProvider } from "@/context/role-context"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { RoleSwitcher } from "@/components/layout/role-switcher"
import { ErrorBoundary } from "@/components/shared"
import { useDb } from "@/hooks/use-db"

function SeedIndicator() {
  const { seededAt } = useDb()
  if (!seededAt) return null

  return (
    <span className="hidden text-xs text-muted-foreground sm:inline">
      H2 seeded {new Date(seededAt).toLocaleTimeString()}
    </span>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DbProvider>
      <RoleProvider>
        <div className="flex min-h-full flex-1 bg-[var(--rx-mist)]">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 items-center justify-end gap-3 border-b border-border/70 bg-[var(--rx-paper)]/80 px-6 backdrop-blur">
              <SeedIndicator />
              <span className="text-xs text-muted-foreground">Demo role</span>
              <RoleSwitcher />
            </header>
            <main className="flex-1 px-6 py-8 sm:px-8">
              <ErrorBoundary title="This view failed to load">
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </RoleProvider>
    </DbProvider>
  )
}
