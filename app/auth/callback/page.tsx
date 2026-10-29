"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ROUTES } from "@/lib/constants/routes"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Confirming your email…")

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function finish() {
      const hash = window.location.hash.replace(/^#/, "")
      const query = window.location.search.replace(/^\?/, "")
      const params = new URLSearchParams(hash || query)

      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      const code = params.get("code")
      const errorDescription = params.get("error_description")

      if (errorDescription) {
        if (active) setMessage(errorDescription)
        return
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          if (active) setMessage(error.message)
          return
        }
        router.replace(ROUTES.dashboard)
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          if (active) setMessage(error.message)
          return
        }
        router.replace(ROUTES.dashboard)
        return
      }

      if (active) {
        setMessage("Verification link is invalid or expired. Try logging in.")
      }
    }

    void finish()
    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[var(--rx-mist)] px-6">
      <p className="max-w-md text-center text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline">
        <Link href={ROUTES.login}>Back to login</Link>
      </Button>
    </div>
  )
}
