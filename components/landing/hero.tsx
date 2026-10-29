import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { WorkflowVisual } from "@/components/landing/workflow-visual"

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <WorkflowVisual />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-24 pt-28 sm:pb-28 sm:pt-32">
        <p className="rx-rise font-heading text-5xl leading-none tracking-tight text-[var(--rx-paper)] sm:text-7xl md:text-8xl">
          Relworx
        </p>
        <h1 className="rx-rise-delay mt-6 max-w-xl font-heading text-2xl leading-snug tracking-tight text-[var(--rx-paper)] sm:text-3xl md:text-4xl">
          From brief to approved content.
        </h1>
        <p className="rx-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-[var(--rx-mist)]/90 sm:text-lg">
          Draft campaign copy and visuals, send them through review, and keep
          only approved assets in your library.
        </p>
        <div className="rx-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-[var(--rx-signal)] px-6 text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
          >
            <Link href={ROUTES.campaigns}>Enter workspace</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full border-white/25 bg-transparent px-6 text-[var(--rx-paper)] hover:bg-white/10 hover:text-[var(--rx-paper)]"
          >
            <Link href={ROUTES.campaignNew}>Start a campaign</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
