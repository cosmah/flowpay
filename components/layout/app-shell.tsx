"use client"

import type { ReactNode } from "react"
import { RoleProvider } from "@/context/role-context"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { RoleSwitcher } from "@/components/layout/role-switcher"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex min-h-full flex-1 bg-[var(--rx-mist)]">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-end gap-3 border-b border-border/70 bg-[var(--rx-paper)]/80 px-6 backdrop-blur">
            <span className="text-xs text-muted-foreground">Demo role</span>
            <RoleSwitcher />
          </header>
          <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </RoleProvider>
  )
}
