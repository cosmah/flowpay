import { createClient } from "@/lib/supabase/client"
import type { PublicUser, UserRole } from "@/types"
import type { Tables } from "@/lib/supabase/types"
import {
  fieldErrorsFromZod,
  loginSchema,
  registerSchema,
  sanitizeAuthInput,
} from "./validation"

export type AuthResult =
  | { ok: true; user: PublicUser }
  | { ok: false; message: string; fields?: Record<string, string> }

function profileToUser(profile: Tables<"profiles">): PublicUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
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
    const message =
      error?.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error?.message ?? "Sign in failed."
    return {
      ok: false,
      message,
      fields: { form: message },
    }
  }

  const user = await fetchProfile(data.user.id)
  if (!user) {
    // Profile trigger may lag; fall back to metadata.
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
        role: (meta.role === "reviewer" ? "reviewer" : "marketer") as UserRole,
        createdAt: data.user.created_at,
      },
    }
  }

  if (user && (await isDisabled(user.id))) {
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

export async function registerAccount(input: {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    name: sanitizeAuthInput(input.name),
    email: sanitizeAuthInput(input.email),
    password: input.password,
    confirmPassword: input.confirmPassword,
    role: input.role,
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fields: fieldErrorsFromZod(parsed.error),
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
    },
  })

  if (error || !data.user) {
    const message = error?.message ?? "Could not create account."
    const fields: Record<string, string> = { form: message }
    if (/already/i.test(message)) {
      fields.email = "Email is already registered"
    }
    return { ok: false, message, fields }
  }

  // Supabase projects often require email confirmation; confirm via service role
  // so the user can enter the workspace immediately after register.
  if (!data.session) {
    const confirmRes = await fetch("/api/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id }),
    })
    if (!confirmRes.ok) {
      const payload = (await confirmRes.json().catch(() => null)) as {
        error?: string
      } | null
      return {
        ok: false,
        message:
          payload?.error ??
          "Account created, but email confirmation is required. Confirm in Supabase Auth settings or your inbox.",
        fields: { form: "Email confirmation required" },
      }
    }

    const login = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    if (login.error) {
      return {
        ok: false,
        message: login.error.message,
        fields: { form: login.error.message },
      }
    }
  }

  // Ensure profile row exists even if trigger is delayed.
  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      status: "active",
    },
    { onConflict: "id" }
  )

  const user =
    (await fetchProfile(data.user.id)) ??
    ({
      id: data.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      createdAt: data.user.created_at,
    } satisfies PublicUser)

  return { ok: true, user }
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
      role:
        session.user.user_metadata?.role === "reviewer"
          ? "reviewer"
          : "marketer",
      createdAt: session.user.created_at,
    }
  )
}
