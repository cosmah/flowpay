"use client"

import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProjectSwitcher } from "@/components/layout/project-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { ErrorBoundary } from "@/components/shared"
import { DbProvider } from "@/context/db-context"
import { LibraryProvider } from "@/context/library-context"
import { ProjectProvider } from "@/context/project-context"
import { RoleProvider } from "@/context/role-context"
import { TaskProvider } from "@/context/task-context"
import { TeamProvider } from "@/context/team-context"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DbProvider>
      <TeamProvider>
        <RoleProvider>
          <ProjectProvider>
            <TaskProvider>
              <LibraryProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                      <ProjectSwitcher />
                      <div className="ml-auto flex items-center">
                        <UserMenu />
                      </div>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 md:px-8">
                      <ErrorBoundary title="This view failed to load">
                        {children}
                      </ErrorBoundary>
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              </LibraryProvider>
            </TaskProvider>
          </ProjectProvider>
        </RoleProvider>
      </TeamProvider>
    </DbProvider>
  )
}
