import { createClient } from "@/lib/supabase/client"
import type { PublicUser, UserRole } from "@/types"
import type { Tables } from "@/lib/supabase/types"
import {
  fieldErrorsFromZod,
  loginSchema,
  sanitizeAuthInput,
} from "./validation"

export type AuthResult =
  | { ok: true; user: PublicUser }
  | {
      ok: false
      message: string
      fields?: Record<string, string>
      needsVerification?: boolean
    }

export type RegisterResult =
  | { ok: true; needsVerification: true; message: string }
  | { ok: false; message: string; fields?: Record<string, string> }

function normalizeRole(role: string | undefined): UserRole {
  if (role === "admin" || role === "reviewer" || role === "marketer") return role
  return "marketer"
}

async function profileToUser(
  profile: Tables<"profiles">
): Promise<PublicUser> {
  const supabase = createClient()
  let companyName: string | null = null
  if (profile.company_id) {
    const { data } = await supabase
      .from("companies")
      .select("name")
      .eq("id", profile.company_id)
      .maybeSingle()
    companyName = data?.name ?? null
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: normalizeRole(profile.role),
    companyId: profile.company_id,
    companyName,
    createdAt: profile.created_at,
  }
}

async function fetchProfile(userId: string): Promise<PublicUser | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null
  return profileToUser(data)
}

export async function loginWithCredentials(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: sanitizeAuthInput(input.email),
    password: input.password,
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fields: fieldErrorsFromZod(parsed.error),
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    const raw = error?.message ?? "Sign in failed."
    const needsVerification = /confirm|verified|verification/i.test(raw)
    const message = needsVerification
      ? "Confirm the verification email we sent before signing in."
      : raw === "Invalid login credentials"
        ? "Incorrect email or password."
        : raw
    return {
      ok: false,
      message,
      fields: { form: message },
      needsVerification,
    }
  }

  const user = await fetchProfile(data.user.id)
  if (!user) {
    const meta = data.user.user_metadata ?? {}
    return {
      ok: true,
      user: {
        id: data.user.id,
        name:
          (typeof meta.name === "string" && meta.name) ||
          data.user.email?.split("@")[0] ||
          "User",
        email: data.user.email ?? parsed.data.email,
        role: normalizeRole(
          typeof meta.role === "string" ? meta.role : undefined
        ),
        companyId: null,
        companyName:
          typeof meta.company_name === "string" ? meta.company_name : null,
        createdAt: data.user.created_at,
      },
    }
  }

  if (await isDisabled(user.id)) {
    await supabase.auth.signOut()
    return {
      ok: false,
      message: "This account has been disabled.",
      fields: { form: "This account has been disabled." },
    }
  }

  return { ok: true, user }
}

async function isDisabled(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle()
  return data?.status === "disabled"
}

/** Company admin self-serve signup — verification email required. */
export async function registerCompanyAdmin(input: {
  name: string
  companyName: string
  email: string
  password: string
  confirmPassword: string
}): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = (await response.json()) as RegisterResult
  return payload
}

/** Accept a company invite (also requires email verification). */
export async function registerFromInvite(input: {
  name: string
  email: string
  password: string
  confirmPassword: string
  inviteToken: string
}): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return (await response.json()) as RegisterResult
}

export async function logoutSession() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return null
  return (
    (await fetchProfile(session.user.id)) ?? {
      id: session.user.id,
      name:
        (typeof session.user.user_metadata?.name === "string" &&
          session.user.user_metadata.name) ||
        session.user.email?.split("@")[0] ||
        "User",
      email: session.user.email ?? "",
      role: normalizeRole(
        typeof session.user.user_metadata?.role === "string"
          ? session.user.user_metadata.role
          : undefined
      ),
      companyId: null,
      companyName:
        typeof session.user.user_metadata?.company_name === "string"
          ? session.user.user_metadata.company_name
          : null,
      createdAt: session.user.created_at,
    }
  )
}
