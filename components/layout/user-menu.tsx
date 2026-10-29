"use client"

import Link from "next/link"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

/** Standout topbar avatar — opens the signed-in account screen. */
export function UserMenu({ className }: { className?: string }) {
  const { currentUser } = useTeam()

  return (
    <Link
      href={ROUTES.account}
      title={currentUser.name}
      aria-label={`Open account for ${currentUser.name}`}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--rx-ink)] text-sm font-semibold tracking-wide text-[var(--rx-paper)] shadow-lg ring-2 ring-[var(--rx-lagoon)] ring-offset-2 ring-offset-background transition hover:scale-105 hover:bg-[var(--rx-ink)]/90",
        className
      )}
    >
      {currentUser.initials}
    </Link>
  )
}
