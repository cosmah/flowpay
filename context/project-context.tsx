"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useDb } from "@/hooks/use-db"
import type { Project } from "@/types"

const ACTIVE_PROJECT_KEY = "flowpay.active.project"

interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  activeProjectId: string | null
  setActiveProjectId: (id: string) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { db } = useDb()
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (db.projects.length === 0) {
      setActiveProjectIdState(null)
      return
    }

    const stored =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(ACTIVE_PROJECT_KEY)
        : null
    const exists = stored && db.projects.some((p) => p.id === stored)
    setActiveProjectIdState(exists ? stored : db.projects[0].id)
  }, [db.projects])

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id)
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ACTIVE_PROJECT_KEY, id)
    }
  }, [])

  const activeProject =
    db.projects.find((project) => project.id === activeProjectId) ?? null

  const value = useMemo(
    () => ({
      projects: db.projects,
      activeProject,
      activeProjectId,
      setActiveProjectId,
    }),
    [db.projects, activeProject, activeProjectId, setActiveProjectId]
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
