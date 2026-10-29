"use client"

import Link from "next/link"
import { Building2, FolderKanban } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { ROUTES } from "@/lib/constants/routes"

/** Sidebar header — current company workspace. */
export function TeamSwitcher() {
  const { user } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={ROUTES.campaigns}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.companyName ?? "FlowPay"}
              </span>
              <span className="truncate text-xs capitalize">
                {user?.role ?? "member"} · <FolderKanban className="inline size-3" />{" "}
                campaigns
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
