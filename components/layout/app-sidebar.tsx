"use client"

import {
  BookOpen,
  FolderKanban,
  Folders,
  Home,
  LayoutDashboard,
  Library,
  ListChecks,
  PlusCircle,
  ScanSearch,
  Users,
} from "lucide-react"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useRole } from "@/hooks/use-role"
import { ROUTES } from "@/lib/constants/routes"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isMarketer, isReviewer } = useRole()

  const platform = [
    {
      title: "Dashboard",
      url: ROUTES.dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: ROUTES.projects,
      icon: Folders,
      items: [
        { title: "All projects", url: ROUTES.projects },
        ...(isMarketer
          ? [{ title: "New project", url: ROUTES.projectNew }]
          : []),
      ],
    },
    {
      title: "Campaigns",
      url: ROUTES.campaigns,
      icon: FolderKanban,
      items: [
        { title: "All campaigns", url: ROUTES.campaigns },
        ...(isMarketer
          ? [{ title: "New campaign", url: ROUTES.campaignNew }]
          : []),
      ],
    },
    {
      title: "Tasks",
      url: ROUTES.tasks,
      icon: ListChecks,
      items: [
        { title: "List", url: ROUTES.tasks },
        { title: "Board", url: ROUTES.taskBoard },
      ],
    },
    ...(isReviewer
      ? [
          {
            title: "Review",
            url: ROUTES.review,
            icon: ScanSearch,
          },
        ]
      : []),
    {
      title: "Library",
      url: ROUTES.library,
      icon: Library,
    },
    {
      title: "Team",
      url: ROUTES.team,
      icon: Users,
    },
  ]

  const shortcuts = [
    {
      title: "Marketing site",
      url: ROUTES.home,
      icon: Home,
    },
    {
      title: "How it works",
      url: ROUTES.howItWorks,
      icon: BookOpen,
    },
    ...(isMarketer
      ? [
          {
            title: "Create campaign",
            url: ROUTES.campaignNew,
            icon: PlusCircle,
          },
        ]
      : []),
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={platform} />
        <NavSecondary items={shortcuts} label="Shortcuts" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
