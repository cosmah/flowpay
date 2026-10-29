"use client"

import type { ReactNode } from "react"
import { DbProvider } from "@/context/db-context"
import { LibraryProvider } from "@/context/library-context"
import { NotificationProvider } from "@/context/notification-context"
import { ProjectProvider } from "@/context/project-context"
import { RoleProvider } from "@/context/role-context"
import { TaskProvider } from "@/context/task-context"
import { TeamProvider } from "@/context/team-context"

/** Workspace data providers only — keep chrome/shell imports separate. */
export function WorkspaceProviders({ children }: { children: ReactNode }) {
  return (
    <DbProvider>
      <TeamProvider>
        <RoleProvider>
          <ProjectProvider>
            <TaskProvider>
              <LibraryProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </LibraryProvider>
            </TaskProvider>
          </ProjectProvider>
        </RoleProvider>
      </TeamProvider>
    </DbProvider>
  )
}
