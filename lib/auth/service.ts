import { h2 } from "@/lib/h2"
import type { AuthUser, PublicUser, UserRole } from "@/types"
import {
  fieldErrorsFromZod,
  loginSchema,
  registerSchema,
  sanitizeAuthInput,
} from "./validation"

export type AuthResult =
  | { ok: true; user: PublicUser }
  | { ok: false; message: string; fields?: Record<string, string> }

function toPublicUser(user: AuthUser): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

function normalizeEmail(email: string) {
  return sanitizeAuthInput(email).toLowerCase()
}

function ensureDb() {
  h2.connect()
}

export function loginWithCredentials(input: {
  email: string
  password: string
}): AuthResult {
  ensureDb()

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

  const email = parsed.data.email
  const password = parsed.data.password

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." }
  }

  const user = h2.findUserByEmail(email)
  if (!user) {
    return {
      ok: false,
      message: "No account found for that email.",
      fields: { email: "No account found for that email" },
    }
  }

  if (user.password !== password) {
    return {
      ok: false,
      message: "Incorrect password. Check caps lock and try again.",
      fields: { password: "Incorrect password" },
    }
  }

  return { ok: true, user: toPublicUser(user) }
}

export function registerAccount(input: {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}): AuthResult {
  ensureDb()

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

  const email = normalizeEmail(parsed.data.email)

  if (h2.findUserByEmail(email)) {
    return {
      ok: false,
      message: "An account with this email already exists.",
      fields: { email: "Email is already registered" },
    }
  }

  const created = h2.createUser({
    name: parsed.data.name,
    email,
    password: parsed.data.password,
    role: parsed.data.role,
  })

  return { ok: true, user: toPublicUser(created) }
}
