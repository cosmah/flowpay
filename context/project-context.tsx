"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import type { Project } from "@/types"

interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  activeProjectId: string | null
  setActiveProjectId: (id: string) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

/** Kept for compatibility; Supabase schema has no projects table. */
export function ProjectProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      projects: [] as Project[],
      activeProject: null,
      activeProjectId: null,
      setActiveProjectId: () => undefined,
    }),
    []
  )

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error("useProject must be used within ProjectProvider")
  }
  return ctx
}
