import type { UserRole } from "@/types"

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  features: "/#features",
  howItWorks: "/#how-it-works",
  dashboard: "/dashboard",
  projects: "/projects",
  projectNew: "/projects/new",
  project: (id: string) => `/projects/${id}` as const,
  projectEdit: (id: string) => `/projects/${id}/edit` as const,
  campaigns: "/campaigns",
  campaignNew: "/campaigns/new",
  campaign: (id: string) => `/campaigns/${id}` as const,
  campaignEdit: (id: string) => `/campaigns/${id}/edit` as const,
  tasks: "/tasks",
  taskBoard: "/tasks/board",
  tasksOwner: (owner: string) =>
    `/tasks?owner=${encodeURIComponent(owner)}` as const,
  review: "/review",
  library: "/library",
  libraryItem: (id: string) => `/library/${id}` as const,
  team: "/team",
  account: "/account",
  notifications: "/notifications",
  notification: (id: string) => `/notifications/${id}` as const,
} as const

export const MARKETING_NAV = [
  { href: ROUTES.features, label: "Features" },
  { href: ROUTES.howItWorks, label: "How it works" },
  { href: ROUTES.library, label: "Library" },
  { href: ROUTES.dashboard, label: "Workspace" },
] as const

export const WORKSPACE_NAV: {
  href: string
  label: string
  roles: UserRole[]
}[] = [
  { href: ROUTES.dashboard, label: "Dashboard", roles: ["marketer", "reviewer"] },
  { href: ROUTES.projects, label: "Projects", roles: ["marketer", "reviewer"] },
  { href: ROUTES.campaigns, label: "Campaigns", roles: ["marketer", "reviewer"] },
  { href: ROUTES.tasks, label: "Tasks", roles: ["marketer", "reviewer"] },
  { href: ROUTES.taskBoard, label: "Task board", roles: ["marketer", "reviewer"] },
  { href: ROUTES.review, label: "Review", roles: ["reviewer"] },
  { href: ROUTES.library, label: "Library", roles: ["marketer", "reviewer"] },
  { href: ROUTES.team, label: "Team", roles: ["marketer", "reviewer"] },
  { href: ROUTES.notifications, label: "Notifications", roles: ["marketer", "reviewer"] },
  { href: ROUTES.account, label: "Account", roles: ["marketer", "reviewer"] },
]

export const AUTH_SESSION_KEY = "flowpay.auth.session"
