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
import {
  getSessionUser,
  loginWithCredentials,
  logoutSession,
  registerAccount,
} from "@/lib/auth/service"
import { createClient } from "@/lib/supabase/client"
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    getSessionUser()
      .then((sessionUser) => {
        if (mounted) setUser(sessionUser)
      })
      .finally(() => {
        if (mounted) setIsReady(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        if (mounted) setUser(null)
        return
      }
      const next = await getSessionUser()
      if (mounted) setUser(next)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const result = await loginWithCredentials(input)
      if (!result.ok) {
        toast.error(result.message)
        return { ok: false, fields: result.fields, message: result.message }
      }

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
      const result = await registerAccount(input)
      if (!result.ok) {
        toast.error(result.message)
        return { ok: false, fields: result.fields, message: result.message }
      }

      setUser(result.user)
      toast.success("Account created. You're signed in.")
      return { ok: true }
    },
    []
  )

  const logout = useCallback(() => {
    void logoutSession()
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
