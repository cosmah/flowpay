"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createSeedLibraryItems } from "@/lib/library/seed"
import type { LibraryItem } from "@/types"

const STORAGE_KEY = "flowpay.library.v2"
const SEEDED_KEY = "flowpay.library.seeded.v2"

type NewLibraryItemInput = Omit<LibraryItem, "id"> & { id?: string }

interface LibraryContextValue {
  items: LibraryItem[]
  addItem: (input: NewLibraryItemInput) => LibraryItem
  getItemsByCampaign: (campaignId: string) => LibraryItem[]
  getItem: (id: string) => LibraryItem | undefined
  /** Live store surface for approve automation (avoids stale React state). */
  approvalStore: {
    items: LibraryItem[]
    addItem: (input: NewLibraryItemInput) => LibraryItem
  }
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function readStoredItems(): LibraryItem[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LibraryItem[]
  } catch {
    return null
  }
}

function writeStoredItems(items: LibraryItem[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LibraryItem[]>([])
  const itemsRef = useRef<LibraryItem[]>([])

  const commit = useCallback((next: LibraryItem[]) => {
    itemsRef.current = next
    setItems(next)
    writeStoredItems(next)
  }, [])

  useEffect(() => {
    const stored = readStoredItems()
    const seeded = window.localStorage.getItem(SEEDED_KEY) === "1"

    if (stored && stored.length > 0) {
      itemsRef.current = stored
      setItems(stored)
    } else if (!seeded) {
      const seed = createSeedLibraryItems()
      itemsRef.current = seed
      setItems(seed)
      writeStoredItems(seed)
      window.localStorage.setItem(SEEDED_KEY, "1")
    } else {
      const empty = stored ?? []
      itemsRef.current = empty
      setItems(empty)
    }
  }, [])

  const addItem = useCallback(
    (input: NewLibraryItemInput) => {
      const item: LibraryItem = {
        id: input.id ?? `lib_${crypto.randomUUID().slice(0, 8)}`,
        campaignId: input.campaignId,
        campaignName: input.campaignName,
        draftId: input.draftId,
        type: input.type,
        title: input.title,
        content: input.content,
        approvedBy: input.approvedBy,
        approvedAt: input.approvedAt,
        tags: input.tags ? [...input.tags] : undefined,
      }
      commit([item, ...itemsRef.current])
      return item
    },
    [commit]
  )

  const getItemsByCampaign = useCallback(
    (campaignId: string) =>
      itemsRef.current.filter((item) => item.campaignId === campaignId),
    [items]
  )

  const getItem = useCallback(
    (id: string) => itemsRef.current.find((item) => item.id === id),
    [items]
  )

  const approvalStore = useMemo(
    () => ({
      get items() {
        return itemsRef.current
      },
      addItem,
    }),
    [addItem]
  )

  const value = useMemo<LibraryContextValue>(
    () => ({
      items,
      addItem,
      getItemsByCampaign,
      getItem,
      approvalStore,
    }),
    [items, addItem, getItemsByCampaign, getItem, approvalStore]
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
