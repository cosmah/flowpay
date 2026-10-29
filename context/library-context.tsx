"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useDb } from "@/hooks/use-db"
import { createClient } from "@/lib/supabase/client"
import type { LibraryItem, TestSendLog, TestSendMode } from "@/types"

interface LibraryContextValue {
  items: LibraryItem[]
  testSends: TestSendLog[]
  getItem: (id: string) => LibraryItem | undefined
  addFromApproval: (item: LibraryItem) => void
  logTestSend: (input: {
    libraryItemId: string
    mode: TestSendMode
    message: string
    result?: TestSendLog["result"]
    sentTo?: string
  }) => Promise<TestSendLog>
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { db, refresh } = useDb()

  const items = db.library
  const testSends = db.testSends

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  )

  const addFromApproval = useCallback(() => {
    void refresh()
  }, [refresh])

  const logTestSend = useCallback(
    async (input: {
      libraryItemId: string
      mode: TestSendMode
      message: string
      result?: TestSendLog["result"]
      sentTo?: string
    }) => {
      const supabase = createClient()
      const item = items.find((row) => row.id === input.libraryItemId)
      const { data, error } = await supabase
        .from("test_sends")
        .insert({
          library_item_id: input.libraryItemId,
          campaign_id: item?.campaignId ?? null,
          content_type: item?.type ?? null,
          title: item?.title ?? null,
          sent_to: input.sentTo ?? "delivered@resend.dev",
          method: input.mode === "resend" ? "resend" : "simulated",
          status: input.result === "error" ? "error" : "logged",
          error_message: input.result === "error" ? input.message : null,
        })
        .select("*")
        .single()

      if (error || !data) {
        throw new Error(error?.message ?? "Could not log test send")
      }

      await refresh()
      return {
        id: data.id,
        libraryItemId: data.library_item_id,
        mode: input.mode,
        result: input.result ?? "submitted",
        message: input.message,
        createdAt: data.sent_at,
      } satisfies TestSendLog
    },
    [items, refresh]
  )

  const value = useMemo(
    () => ({
      items,
      testSends,
      getItem,
      addFromApproval,
      logTestSend,
    }),
    [items, testSends, getItem, addFromApproval, logTestSend]
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider")
  }
  return ctx
}
