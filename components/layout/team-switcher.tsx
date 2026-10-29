"use client"

import Link from "next/link"
import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"
import { useProject } from "@/hooks/use-project"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

/** Sidebar header — company + active project switcher. */
export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { user } = useAuth()
  const { canMarket } = useRole()
  const { projects, activeProject, activeProjectId, setActiveProjectId } =
    useProject()

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
                <FolderKanban className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeProject?.name ?? user?.companyName ?? "Select project"}
                </span>
                <span className="truncate text-xs capitalize">
                  {activeProject?.status ?? user?.companyName ?? "No project"}
                </span>
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
              {user?.companyName ?? "Projects"}
            </DropdownMenuLabel>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <FolderKanban className="size-3.5 shrink-0" />
                </div>
                <span className="truncate">{project.name}</span>
                <DropdownMenuShortcut>
                  <Check
                    className={cn(
                      "size-4",
                      project.id === activeProjectId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            {canMarket ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href={ROUTES.projectNew}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      New project
                    </span>
                  </Link>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
