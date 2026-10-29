import type { TeamMember } from "@/types"

/** First-load demo seed: 2 marketers + 1 reviewer. */
export function createSeedMembers(): TeamMember[] {
  return [
    {
      id: "member_maya",
      name: "Maya Okonkwo",
      role: "marketer",
      initials: "MO",
    },
    {
      id: "member_jordan",
      name: "Jordan Blake",
      role: "marketer",
      initials: "JB",
    },
    {
      id: "member_amina",
      name: "Amina Hassan",
      role: "reviewer",
      initials: "AH",
    },
  ]
}

export const DEFAULT_MARKETER_ID = "member_maya"
export const DEFAULT_REVIEWER_ID = "member_amina"
