"use client"

import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { NotificationBell } from "@/components/layout/notification-bell"
import { ProjectSwitcher } from "@/components/layout/project-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { ErrorBoundary } from "@/components/shared/error-boundary"

/** Sidebar + topbar chrome. Children stay pass-through for faster route swaps. */
export function WorkspaceChrome({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <ProjectSwitcher />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex w-full flex-1 flex-col gap-4 px-3 py-4 sm:px-4">
          <ErrorBoundary title="This view failed to load">{children}</ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
