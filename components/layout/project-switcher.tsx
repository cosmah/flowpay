"use client"

import Link from "next/link"
import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useProject } from "@/hooks/use-project"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

/** Compact project switcher for the workspace top bar. */
export function ProjectSwitcher() {
  const { projects, activeProject, activeProjectId, setActiveProjectId } =
    useProject()
  const { canMarket } = useRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[14rem] justify-between gap-2"
        >
          <span className="flex min-w-0 items-center gap-2">
            <FolderKanban className="size-3.5 shrink-0" />
            <span className="truncate">
              {activeProject?.name ?? "Select project"}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Projects
        </DropdownMenuLabel>
        {projects.length === 0 ? (
          <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
        ) : (
          projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className="gap-2"
            >
              <Check
                className={cn(
                  "size-3.5",
                  project.id === activeProjectId ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{project.name}</span>
            </DropdownMenuItem>
          ))
        )}
        {canMarket ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.projectNew} className="gap-2">
                <Plus className="size-3.5" />
                New project
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
