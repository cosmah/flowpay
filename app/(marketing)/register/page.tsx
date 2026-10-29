import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-6 py-16">
      <AuthCard
        title="Create your FlowPay account"
        description="Register as a marketer or reviewer. Validation catches empty fields, weak passwords, and duplicates."
      >
        <RegisterForm />
      </AuthCard>
    </div>
  )
}
