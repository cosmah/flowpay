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
  registerCompanyAdmin,
  registerFromInvite,
  type RegisterResult,
} from "@/lib/auth/service"
import { createClient } from "@/lib/supabase/client"
import type { PublicUser } from "@/types"

interface AuthContextValue {
  user: PublicUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (input: {
    email: string
    password: string
  }) => Promise<{ ok: boolean; fields?: Record<string, string>; message?: string }>
  registerCompany: (input: {
    name: string
    companyName: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<RegisterResult>
  registerInvite: (input: {
    name: string
    email: string
    password: string
    confirmPassword: string
    inviteToken: string
  }) => Promise<RegisterResult>
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

  const registerCompany = useCallback(
    async (input: {
      name: string
      companyName: string
      email: string
      password: string
      confirmPassword: string
    }) => {
      const result = await registerCompanyAdmin(input)
      if (!result.ok) toast.error(result.message)
      else toast.success(result.message)
      return result
    },
    []
  )

  const registerInvite = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      confirmPassword: string
      inviteToken: string
    }) => {
      const result = await registerFromInvite(input)
      if (!result.ok) toast.error(result.message)
      else toast.success(result.message)
      return result
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
      registerCompany,
      registerInvite,
      logout,
    }),
    [user, isReady, login, registerCompany, registerInvite, logout]
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
