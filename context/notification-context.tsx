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
import { createSeedNotifications } from "@/lib/notifications/seed"
import type { AppNotification } from "@/types"

const STORAGE_KEY = "flowpay.notifications.v1"
const SEEDED_KEY = "flowpay.notifications.seeded.v1"

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  getNotification: (id: string) => AppNotification | undefined
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function readStored(): AppNotification[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppNotification[]
  } catch {
    return null
  }
}

function writeStored(items: AppNotification[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const ref = useRef<AppNotification[]>([])

  const commit = useCallback((next: AppNotification[]) => {
    ref.current = next
    setNotifications(next)
    writeStored(next)
  }, [])

  useEffect(() => {
    const stored = readStored()
    const seeded = window.localStorage.getItem(SEEDED_KEY) === "1"
    if (stored && stored.length > 0) {
      ref.current = stored
      setNotifications(stored)
    } else if (!seeded) {
      const seed = createSeedNotifications()
      commit(seed)
      window.localStorage.setItem(SEEDED_KEY, "1")
    } else {
      commit(stored ?? [])
    }
  }, [commit])

  const markRead = useCallback(
    (id: string) => {
      const next = ref.current.map((item) =>
        item.id === id && !item.readAt
          ? { ...item, readAt: new Date().toISOString() }
          : item
      )
      commit(next)
    },
    [commit]
  )

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString()
    commit(
      ref.current.map((item) =>
        item.readAt ? item : { ...item, readAt: now }
      )
    )
  }, [commit])

  const getNotification = useCallback(
    (id: string) => ref.current.find((item) => item.id === id),
    [notifications]
  )

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications]
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markRead,
      markAllRead,
      getNotification,
    }),
    [notifications, unreadCount, markRead, markAllRead, getNotification]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return ctx
}
