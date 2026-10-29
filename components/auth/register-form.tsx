"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  registerCompanyAdmin,
  registerFromInvite,
} from "@/lib/auth/service"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"
import { cn } from "@/lib/utils"

type Fields = Partial<
  Record<
    | "name"
    | "companyName"
    | "email"
    | "password"
    | "confirmPassword"
    | "form",
    string
  >
>

export function RegisterForm() {
  const search = useSearchParams()
  const inviteToken = search.get("invite") ?? ""
  const invitedEmail = search.get("email") ?? ""
  const isInvite = Boolean(inviteToken)

  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState(invitedEmail)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const title = useMemo(
    () =>
      isInvite
        ? "Accept your team invite"
        : "Create your company on FlowPay",
    [isInvite]
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setFields({})
    setSubmitting(true)

    try {
      const result = isInvite
        ? await registerFromInvite({
            name,
            email,
            password,
            confirmPassword,
            inviteToken,
          })
        : await registerCompanyAdmin({
            name,
            companyName,
            email,
            password,
            confirmPassword,
          })

      if (!result.ok) {
        setFields(result.fields ?? { form: result.message })
        setSubmitting(false)
        return
      }

      setSent(true)
      setSubmitting(false)
    } catch (error) {
      const message = handleClientError(error)
      setFields({ form: message })
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-heading text-xl text-[var(--rx-ink)]">
          Check your inbox
        </p>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Open it
          to activate your account
          {isInvite ? "" : " and company admin access"}.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.login}>Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--rx-ink)]">{title}</p>
        <p className="text-xs text-muted-foreground">
          {isInvite
            ? "You’ll join the company that invited you after email verification."
            : "You become the company admin. Marketers and reviewers join by invite only."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
          {fields.name ? (
            <p className="text-xs text-destructive">{fields.name}</p>
          ) : null}
        </div>

        {!isInvite ? (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              name="companyName"
              autoComplete="organization"
              placeholder="Relworx Marketing"
              value={companyName}
              aria-invalid={Boolean(fields.companyName)}
              onChange={(event) => {
                setCompanyName(event.target.value)
                if (fields.companyName)
                  setFields((prev) => ({ ...prev, companyName: undefined }))
              }}
              className="h-10"
            />
            {fields.companyName ? (
              <p className="text-xs text-destructive">{fields.companyName}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value="Invited teammate"
              disabled
              className="h-10"
            />
          </div>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            disabled={Boolean(invitedEmail)}
            aria-invalid={Boolean(fields.email)}
            onChange={(event) => {
              setEmail(event.target.value)
              if (fields.email)
                setFields((prev) => ({ ...prev, email: undefined }))
            }}
            className="h-10"
          />
          {fields.email ? (
            <p className="text-xs text-destructive">{fields.email}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              We’ll email a verification link before you can sign in.
            </p>
          )}
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
              Upper & lowercase, number, and special character.
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
      </div>

      {fields.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          className={cn("h-10 w-full sm:w-auto sm:min-w-44")}
          disabled={submitting}
        >
          {submitting
            ? "Sending verification…"
            : isInvite
              ? "Create account"
              : "Create company"}
        </Button>
        <p className="text-center text-sm text-muted-foreground sm:text-right">
          Already registered?{" "}
          <Link
            href={ROUTES.login}
            className="font-medium text-[var(--rx-ink)] underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  )
}
