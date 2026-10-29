import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in",
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-6 py-16">
      <AuthCard
        title="Log in to FlowPay"
        description="Access campaigns, review queues, and your approved content library."
      >
        <LoginForm />
      </AuthCard>
    </div>
  )
}
