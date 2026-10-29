import type { UserRole } from "./roles"

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

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
