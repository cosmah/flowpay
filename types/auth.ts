import type { UserRole } from "./roles"

export interface AuthUser {
  id: string
  name: string
  email: string
  /** Demo-only plaintext; replace with hashed passwords when Supabase auth lands. */
  password: string
  role: UserRole
  createdAt: string
}

export type PublicUser = Omit<AuthUser, "password">

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}
