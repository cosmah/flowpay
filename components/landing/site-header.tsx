import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href={ROUTES.home}
          className="font-heading text-lg tracking-tight text-[var(--rx-paper)]"
        >
          Relworx
        </Link>
        <Button
          asChild
          size="sm"
          className="bg-[var(--rx-signal)] text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
        >
          <Link href={ROUTES.campaigns}>Open workspace</Link>
        </Button>
      </div>
    </header>
  )
}
