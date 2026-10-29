"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

/** Compact topbar avatar — opens the account / user details screen. */
export function UserMenu({ className }: { className?: string }) {
  const { currentUser } = useTeam()

  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className={cn(
        "size-9 rounded-full border-border/70 bg-[var(--rx-mist)] text-[var(--rx-ink)] hover:bg-[var(--rx-mist)]/80",
        className
      )}
      aria-label={`Open profile for ${currentUser.name}`}
    >
      <Link href={ROUTES.account} title={currentUser.name}>
        <span className="text-[11px] font-semibold tracking-wide">
          {currentUser.initials}
        </span>
      </Link>
    </Button>
  )
}
