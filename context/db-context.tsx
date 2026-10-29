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
import type { Campaign, CampaignBrief, CampaignStatus } from "@/types"

interface DbContextValue {
  db: H2Snapshot
  seededAt: string | null
  reloadFromMock: () => void
  refresh: () => void
  createCampaign: (input: {
    brief: CampaignBrief
    status?: CampaignStatus
    createdBy: string
  }) => Campaign
  updateCampaign: (
    id: string,
    input: { brief: CampaignBrief; status: CampaignStatus }
  ) => Campaign | undefined
  deleteCampaign: (id: string) => boolean
}

const DbContext = createContext<DbContextValue | null>(null)

/**
 * On every browser reload this provider remounts, calls `h2.connect()`,
 * and pours `/data` mock rows into the in-memory H2 tables.
 */
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

  const createCampaign = useCallback(
    (input: {
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
    (id: string, input: { brief: CampaignBrief; status: CampaignStatus }) => {
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

  const value = useMemo<DbContextValue>(
    () => ({
      db,
      seededAt,
      reloadFromMock,
      refresh,
      createCampaign,
      updateCampaign,
      deleteCampaign,
    }),
    [
      db,
      seededAt,
      reloadFromMock,
      refresh,
      createCampaign,
      updateCampaign,
      deleteCampaign,
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
