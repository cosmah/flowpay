import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-4 py-8 sm:px-6 sm:py-10">
      <AuthRedirect>
        <AuthCard
          wide
          title="Create your FlowPay company"
          description="Registration creates your company and makes you the admin. Invite marketers and reviewers after you verify your email — data never crosses companies."
        >
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <RegisterForm />
          </Suspense>
        </AuthCard>
      </AuthRedirect>
    </div>
  )
}
