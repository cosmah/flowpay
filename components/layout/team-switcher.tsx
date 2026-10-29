"use client"

import Link from "next/link"
import { FolderKanban, Plus } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"

/** Sidebar header — campaigns workspace (projects removed for Supabase schema). */
export function TeamSwitcher() {
  const { isMarketer } = useRole()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={ROUTES.campaigns}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <FolderKanban className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">FlowPay</span>
              <span className="truncate text-xs">Campaigns workspace</span>
            </div>
            {isMarketer ? <Plus className="ml-auto size-4 opacity-60" /> : null}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
