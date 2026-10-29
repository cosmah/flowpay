"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { h2, type H2Snapshot } from "@/lib/h2"

interface DbContextValue {
  db: H2Snapshot
  seededAt: string | null
  reloadFromMock: () => void
}

const DbContext = createContext<DbContextValue | null>(null)

/**
 * On every browser reload this provider remounts, calls `h2.connect()`,
 * and pours `/data` mock rows into the in-memory H2 tables.
 */
export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<H2Snapshot>(() => h2.connect())
  const [seededAt, setSeededAt] = useState<string | null>(() => h2.getSeededAt())

  const value = useMemo<DbContextValue>(
    () => ({
      db,
      seededAt,
      reloadFromMock: () => {
        const next = h2.connect(true)
        setDb(next)
        setSeededAt(h2.getSeededAt())
      },
    }),
    [db, seededAt]
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
