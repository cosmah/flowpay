"use client"

import type { ReactNode } from "react"
import { WorkspaceChrome } from "@/components/layout/workspace-chrome"
import { WorkspaceProviders } from "@/components/layout/workspace-providers"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProviders>
      <WorkspaceChrome>{children}</WorkspaceChrome>
    </WorkspaceProviders>
  )
}
