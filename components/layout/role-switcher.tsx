"use client"

import { useRole } from "@/hooks/use-role"
import type { UserRole } from "@/types"
import { ROLE_LABELS } from "@/types"
import { cn } from "@/lib/utils"

const roles: UserRole[] = ["marketer", "reviewer"]

export function RoleSwitcher({ className }: { className?: string }) {
  const { role, setRole } = useRole()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background p-1",
        className
      )}
      role="group"
      aria-label="Demo role"
    >
      {roles.map((value) => {
        const active = role === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {ROLE_LABELS[value]}
          </button>
        )
      })}
    </div>
  )
}
