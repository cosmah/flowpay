"use client"

import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeam } from "@/hooks/use-team"
import { ROLE_LABELS } from "@/types"
import { cn } from "@/lib/utils"

export function RoleSwitcher({ className }: { className?: string }) {
  const { members, currentUser, setCurrentUser } = useTeam()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 max-w-[220px] justify-between gap-2 px-2.5",
            className
          )}
          aria-label="Switch team member"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--rx-mist)] text-[10px] font-semibold text-[var(--rx-ink)]">
              {currentUser.initials}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-xs font-medium">
                {currentUser.name}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {ROLE_LABELS[currentUser.role]}
              </span>
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Switch user</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {members.map((member) => {
          const active = member.id === currentUser.id
          return (
            <DropdownMenuItem
              key={member.id}
              onClick={() => setCurrentUser(member.id)}
              className={cn(active && "bg-muted")}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--rx-mist)] text-[10px] font-semibold">
                {member.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{member.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {ROLE_LABELS[member.role]}
                </span>
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
