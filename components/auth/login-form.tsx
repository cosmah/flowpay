"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"
import { cn } from "@/lib/utils"

type Fields = Partial<Record<"email" | "password" | "form", string>>

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setFields({})
    setSubmitting(true)

    try {
      const result = await login({ email, password })
      if (!result.ok) {
        setFields(result.fields ?? { form: result.message })
        return
      }
      router.push(ROUTES.dashboard)
    } catch (error) {
      const message = handleClientError(error)
      setFields({ form: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          aria-invalid={Boolean(fields.email)}
          onChange={(event) => {
            setEmail(event.target.value)
            if (fields.email) setFields((prev) => ({ ...prev, email: undefined }))
          }}
          className="h-10"
        />
        {fields.email ? (
          <p className="text-xs text-destructive">{fields.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          aria-invalid={Boolean(fields.password)}
          onChange={(event) => {
            setPassword(event.target.value)
            if (fields.password)
              setFields((prev) => ({ ...prev, password: undefined }))
          }}
          className="h-10"
        />
        {fields.password ? (
          <p className="text-xs text-destructive">{fields.password}</p>
        ) : null}
      </div>

      {fields.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <Button type="submit" className="h-10 w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={ROUTES.register}
          className={cn("font-medium text-[var(--rx-ink)] underline-offset-4 hover:underline")}
        >
          Register
        </Link>
      </p>

      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Demo: <span className="font-medium">marketer@flowpay.dev</span> or{" "}
        <span className="font-medium">reviewer@flowpay.dev</span> · password{" "}
        <span className="font-medium">Flowpay123!</span>
      </p>
    </form>
  )
}
