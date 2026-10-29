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
import { toast } from "sonner"
import { loginWithCredentials, registerAccount } from "@/lib/auth/service"
import { AUTH_SESSION_KEY } from "@/lib/constants/routes"
import { h2 } from "@/lib/h2"
import type { PublicUser, UserRole } from "@/types"

interface AuthContextValue {
  user: PublicUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (input: {
    email: string
    password: string
  }) => Promise<{ ok: boolean; fields?: Record<string, string>; message?: string }>
  register: (input: {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: UserRole
  }) => Promise<{ ok: boolean; fields?: Record<string, string>; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): PublicUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PublicUser
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

function writeSession(user: PublicUser | null) {
  if (typeof window === "undefined") return
  if (!user) {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    return
  }
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Ensure H2 mock users exist before any auth attempt (also covers marketing routes).
    h2.connect()
    setUser(readSession())
    setIsReady(true)
  }, [])

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const result = loginWithCredentials(input)
      if (!result.ok) {
        toast.error(result.message)
        return { ok: false, fields: result.fields, message: result.message }
      }

      writeSession(result.user)
      setUser(result.user)
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`)
      return { ok: true }
    },
    []
  )

  const register = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      confirmPassword: string
      role: UserRole
    }) => {
      const result = registerAccount(input)
      if (!result.ok) {
        toast.error(result.message)
        return { ok: false, fields: result.fields, message: result.message }
      }

      writeSession(result.user)
      setUser(result.user)
      toast.success("Account created. You're signed in.")
      return { ok: true }
    },
    []
  )

  const logout = useCallback(() => {
    writeSession(null)
    setUser(null)
    toast.message("Signed out")
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      login,
      register,
      logout,
    }),
    [user, isReady, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
