import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in",
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-6 py-16">
      <AuthRedirect>
        <AuthCard
          title="Log in to FlowPay"
          description="Access campaigns, review queues, and your approved content library."
        >
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading…</p>
            }
          >
            <LoginForm />
          </Suspense>
        </AuthCard>
      </AuthRedirect>
    </div>
  )
}
