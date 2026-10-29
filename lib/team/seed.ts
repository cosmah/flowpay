import type { TeamMember } from "@/types"

/** First-load seed aligned with login accounts + one extra invitee. */
export function createSeedMembers(): TeamMember[] {
  return [
    {
      id: "member_amina_okello",
      name: "Amina Okello",
      email: "marketer@flowpay.dev",
      role: "marketer",
      initials: "AO",
      status: "active",
    },
    {
      id: "member_jordan_mensah",
      name: "Jordan Mensah",
      email: "reviewer@flowpay.dev",
      role: "reviewer",
      initials: "JM",
      status: "active",
    },
    {
      id: "member_maya",
      name: "Maya Okonkwo",
      email: "maya@flowpay.dev",
      role: "marketer",
      initials: "MO",
      status: "active",
    },
  ]
}

export const DEFAULT_MARKETER_ID = "member_amina_okello"
export const DEFAULT_REVIEWER_ID = "member_jordan_mensah"
