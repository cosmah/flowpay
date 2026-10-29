"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { MARKETING_NAV, ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { user, isAuthenticated, logout, isReady } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--rx-ink)]/95 text-[var(--rx-paper)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link
          href={ROUTES.home}
          className="font-heading text-lg tracking-tight text-[var(--rx-paper)]"
          onClick={() => setOpen(false)}
        >
          FlowPay
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-[var(--rx-mist)]/85 transition-colors hover:bg-white/10 hover:text-[var(--rx-paper)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {!isReady ? null : isAuthenticated ? (
            <>
              <span className="max-w-[10rem] truncate text-xs text-[var(--rx-mist)]/80">
                {user?.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-[var(--rx-paper)] hover:bg-white/10 hover:text-[var(--rx-paper)]"
                onClick={logout}
              >
                Sign out
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[var(--rx-signal)] text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
              >
                <Link href={ROUTES.campaigns}>Open workspace</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-[var(--rx-paper)] hover:bg-white/10 hover:text-[var(--rx-paper)]"
              >
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[var(--rx-signal)] text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
              >
                <Link href={ROUTES.register}>Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-[var(--rx-paper)] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-white/10 bg-[var(--rx-ink)] md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-[var(--rx-mist)]/90 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
            {!isReady ? null : isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="bg-[var(--rx-signal)] text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
                  onClick={() => setOpen(false)}
                >
                  <Link href={ROUTES.campaigns}>Open workspace</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent text-[var(--rx-paper)] hover:bg-white/10"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-transparent text-[var(--rx-paper)] hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  <Link href={ROUTES.login}>Log in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[var(--rx-signal)] text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
                  onClick={() => setOpen(false)}
                >
                  <Link href={ROUTES.register}>Register</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
