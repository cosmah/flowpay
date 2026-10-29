import type { UserRole } from "./roles"

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string | null
  companyName: string | null
  createdAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  companyName: string
  email: string
  password: string
  confirmPassword: string
  inviteToken?: string
}
