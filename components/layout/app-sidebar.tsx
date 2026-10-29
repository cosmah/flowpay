"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES, WORKSPACE_NAV } from "@/lib/constants/routes"
import { useRole } from "@/hooks/use-role"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const { role } = useRole()

  const items = WORKSPACE_NAV.filter((item) =>
    item.roles.includes(role)
  )

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/70 bg-[var(--rx-paper)]">
      <div className="border-b border-border/70 px-5 py-5">
        <Link href="/" className="font-heading text-xl tracking-tight text-[var(--rx-ink)]">
          FlowPay
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Workspace</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            item.href === ROUTES.dashboard
              ? pathname === ROUTES.dashboard
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
