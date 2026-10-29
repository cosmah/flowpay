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
import type { AppNotification } from "@/types"

const STORAGE_KEY = "flowpay.notifications.v2"

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  getNotification: (id: string) => AppNotification | undefined
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function readStored(): AppNotification[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AppNotification[]
  } catch {
    return []
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
    ref.current = stored
    setNotifications(stored)
  }, [])

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
