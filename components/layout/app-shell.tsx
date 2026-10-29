"use client"

import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { RoleSwitcher } from "@/components/layout/role-switcher"
import { ErrorBoundary } from "@/components/shared"
import { DbProvider } from "@/context/db-context"
import { RoleProvider } from "@/context/role-context"
import { useDb } from "@/hooks/use-db"

function SeedIndicator() {
  const { seededAt } = useDb()
  if (!seededAt) return null

  return (
    <span className="hidden text-xs text-muted-foreground lg:inline">
      H2 seeded {new Date(seededAt).toLocaleTimeString()}
    </span>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DbProvider>
      <RoleProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="font-heading text-sm tracking-tight text-[var(--rx-ink)]">
                FlowPay workspace
              </div>
              <div className="ml-auto flex items-center gap-3">
                <SeedIndicator />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Demo role
                </span>
                <RoleSwitcher />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 md:px-8">
              <ErrorBoundary title="This view failed to load">
                {children}
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </RoleProvider>
    </DbProvider>
  )
}
