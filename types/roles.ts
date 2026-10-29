export type UserRole = "admin" | "marketer" | "reviewer"

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  marketer: "Marketer",
  reviewer: "Reviewer",
}

/** Roles an admin may invite into their company. */
export const INVITABLE_ROLES: UserRole[] = ["marketer", "reviewer"]
