"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { h2, type H2Snapshot } from "@/lib/h2"
import type {
  Campaign,
  CampaignBrief,
  CampaignStatus,
  Draft,
  Project,
  ProjectStatus,
} from "@/types"

interface DbContextValue {
  db: H2Snapshot
  seededAt: string | null
  reloadFromMock: () => void
  refresh: () => void
  createProject: (input: {
    name: string
    description: string
    status?: ProjectStatus
    createdBy: string
  }) => Project
  updateProject: (
    id: string,
    input: { name: string; description: string; status: ProjectStatus }
  ) => Project | undefined
  deleteProject: (id: string) => boolean
  createCampaign: (input: {
    projectId: string
    brief: CampaignBrief
    status?: CampaignStatus
    createdBy: string
  }) => Campaign
  updateCampaign: (
    id: string,
    input: {
      projectId: string
      brief: CampaignBrief
      status: CampaignStatus
    }
  ) => Campaign | undefined
  deleteCampaign: (id: string) => boolean
  submitDraft: (id: string) => Draft | undefined
  requestDraftChanges: (id: string, body: string) => Draft | undefined
  approveDraft: (id: string) => Draft | undefined
}

const DbContext = createContext<DbContextValue | null>(null)

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<H2Snapshot>(() => h2.connect())
  const [seededAt, setSeededAt] = useState<string | null>(() => h2.getSeededAt())

  const refresh = useCallback(() => {
    setDb(h2.getSnapshot())
  }, [])

  const reloadFromMock = useCallback(() => {
    const next = h2.connect(true)
    setDb(next)
    setSeededAt(h2.getSeededAt())
  }, [])

  const createProject = useCallback(
    (input: {
      name: string
      description: string
      status?: ProjectStatus
      createdBy: string
    }) => {
      const project = h2.createProject(input)
      refresh()
      return project
    },
    [refresh]
  )

  const updateProject = useCallback(
    (
      id: string,
      input: { name: string; description: string; status: ProjectStatus }
    ) => {
      const project = h2.updateProject(id, input)
      refresh()
      return project
    },
    [refresh]
  )

  const deleteProject = useCallback(
    (id: string) => {
      const ok = h2.deleteProject(id)
      refresh()
      return ok
    },
    [refresh]
  )

  const createCampaign = useCallback(
    (input: {
      projectId: string
      brief: CampaignBrief
      status?: CampaignStatus
      createdBy: string
    }) => {
      const campaign = h2.createCampaign(input)
      refresh()
      return campaign
    },
    [refresh]
  )

  const updateCampaign = useCallback(
    (
      id: string,
      input: {
        projectId: string
        brief: CampaignBrief
        status: CampaignStatus
      }
    ) => {
      const campaign = h2.updateCampaign(id, input)
      refresh()
      return campaign
    },
    [refresh]
  )

  const deleteCampaign = useCallback(
    (id: string) => {
      const ok = h2.deleteCampaign(id)
      refresh()
      return ok
    },
    [refresh]
  )

  const submitDraft = useCallback(
    (id: string) => {
      const draft = h2.submitDraft(id)
      refresh()
      return draft
    },
    [refresh]
  )

  const requestDraftChanges = useCallback(
    (id: string, body: string) => {
      const draft = h2.requestDraftChanges(id, body)
      refresh()
      return draft
    },
    [refresh]
  )

  const approveDraft = useCallback(
    (id: string) => {
      const draft = h2.approveDraft(id)
      refresh()
      return draft
    },
    [refresh]
  )

  const value = useMemo<DbContextValue>(
    () => ({
      db,
      seededAt,
      reloadFromMock,
      refresh,
      createProject,
      updateProject,
      deleteProject,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      submitDraft,
      requestDraftChanges,
      approveDraft,
    }),
    [
      db,
      seededAt,
      reloadFromMock,
      refresh,
      createProject,
      updateProject,
      deleteProject,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      submitDraft,
      requestDraftChanges,
      approveDraft,
    ]
  )

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}

export function useDb() {
  const ctx = useContext(DbContext)
  if (!ctx) {
    throw new Error("useDb must be used within DbProvider")
  }
  return ctx
}
