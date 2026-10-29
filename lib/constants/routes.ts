import type { UserRole } from "@/types"

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  features: "/#features",
  howItWorks: "/#how-it-works",
  campaigns: "/campaigns",
  campaignNew: "/campaigns/new",
  campaign: (id: string) => `/campaigns/${id}` as const,
  tasks: "/tasks",
  review: "/review",
  library: "/library",
  libraryItem: (id: string) => `/library/${id}` as const,
} as const

export const MARKETING_NAV = [
  { href: ROUTES.features, label: "Features" },
  { href: ROUTES.howItWorks, label: "How it works" },
  { href: ROUTES.library, label: "Library" },
  { href: ROUTES.campaigns, label: "Workspace" },
] as const

export const WORKSPACE_NAV: {
  href: string
  label: string
  roles: UserRole[]
}[] = [
  { href: ROUTES.campaigns, label: "Campaigns", roles: ["marketer", "reviewer"] },
  { href: ROUTES.tasks, label: "Tasks", roles: ["marketer", "reviewer"] },
  { href: ROUTES.review, label: "Review", roles: ["reviewer"] },
  { href: ROUTES.library, label: "Library", roles: ["marketer", "reviewer"] },
]

export const AUTH_SESSION_KEY = "flowpay.auth.session"
