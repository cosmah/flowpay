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
import type { UserRole } from "@/types"
import { cn } from "@/lib/utils"

type Fields = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "role" | "form", string>
>

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("marketer")
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setFields({})
    setSubmitting(true)

    try {
      const result = await register({
        name,
        email,
        password,
        confirmPassword,
        role,
      })
      if (!result.ok) {
        setFields(result.fields ?? { form: result.message })
        return
      }
      router.push(ROUTES.campaigns)
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
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Amina Okello"
          value={name}
          aria-invalid={Boolean(fields.name)}
          onChange={(event) => {
            setName(event.target.value)
            if (fields.name) setFields((prev) => ({ ...prev, name: undefined }))
          }}
          className="h-10"
        />
        {fields.name ? <p className="text-xs text-destructive">{fields.name}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
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
        <Label>Role</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["marketer", "reviewer"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRole(value)
                if (fields.role) setFields((prev) => ({ ...prev, role: undefined }))
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm capitalize transition-colors",
                role === value
                  ? "border-[var(--rx-ink)] bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {value}
            </button>
          ))}
        </div>
        {fields.role ? <p className="text-xs text-destructive">{fields.role}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
        ) : (
          <p className="text-xs text-muted-foreground">
            Use upper & lowercase, a number, and a special character.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirmPassword}
          aria-invalid={Boolean(fields.confirmPassword)}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            if (fields.confirmPassword)
              setFields((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          className="h-10"
        />
        {fields.confirmPassword ? (
          <p className="text-xs text-destructive">{fields.confirmPassword}</p>
        ) : null}
      </div>

      {fields.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <Button type="submit" className="h-10 w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-[var(--rx-ink)] underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  )
}
