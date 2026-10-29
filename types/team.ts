import type { UserRole } from "@/types/roles"

export interface TeamMember {
  id: string
  name: string
  role: UserRole
  initials: string
}
