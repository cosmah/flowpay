"use client"

import Link from "next/link"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"

export type RoleCapability = "market" | "review" | "manageTeam"

const CAPABILITY_LABEL: Record<RoleCapability, string> = {
  market: "marketer",
  review: "reviewer",
  manageTeam: "admin",
}

export function RoleGate({
  allow,
  children,
  fallbackHref = ROUTES.dashboard,
}: {
  allow: RoleCapability | RoleCapability[]
  children: React.ReactNode
  fallbackHref?: string
}) {
  const { canMarket, canReview, canManageTeam } = useRole()
  const required = Array.isArray(allow) ? allow : [allow]

  const allowed = required.some((capability) => {
    if (capability === "market") return canMarket
    if (capability === "review") return canReview
    if (capability === "manageTeam") return canManageTeam
    return false
  })

  if (!allowed) {
    const needed = required.map((item) => CAPABILITY_LABEL[item]).join(" or ")
    return (
      <EmptyState
        title="Access restricted"
        description={`This screen is for ${needed} accounts. Switch to an account with the right role, or return to the dashboard.`}
        action={
          <Button asChild variant="outline">
            <Link href={fallbackHref}>Back to dashboard</Link>
          </Button>
        }
      />
    )
  }

  return children
}
