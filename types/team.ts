import type { UserRole } from "@/types/roles"

export type TeamMemberStatus = "active" | "disabled"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
  status: TeamMemberStatus
}

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
