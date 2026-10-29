"use client"

import { ChevronsUpDown, GalleryVerticalEnd, PenLine, ShieldCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRole } from "@/hooks/use-role"
import type { UserRole } from "@/types"

const teams: {
  name: string
  plan: string
  role: UserRole
  logo: typeof GalleryVerticalEnd
}[] = [
  {
    name: "FlowPay Marketing",
    plan: "Marketer workspace",
    role: "marketer",
    logo: PenLine,
  },
  {
    name: "FlowPay Review",
    plan: "Reviewer workspace",
    role: "reviewer",
    logo: ShieldCheck,
  },
]

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { role, setRole } = useRole()
  const active = teams.find((team) => team.role === role) ?? teams[0]
  const Logo = active.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{active.name}</span>
                <span className="truncate text-xs">{active.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setRole(team.role)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" disabled>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">FlowPay demo</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
