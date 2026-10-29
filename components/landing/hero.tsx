import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { WorkflowVisual } from "@/components/landing/workflow-visual"

function FlowPayWordmark() {
  return (
    <svg
      className="rx-brand-outline rx-rise"
      viewBox="0 0 860 160"
      role="img"
      aria-label="FlowPay"
    >
      <defs>
        <linearGradient
          id="flowpay-brand-stroke"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--rx-signal)" />
          <stop offset="55%" stopColor="var(--rx-lagoon)" />
          <stop offset="100%" stopColor="var(--rx-signal)" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="none"
        stroke="url(#flowpay-brand-stroke)"
        strokeWidth="2.25"
        strokeLinejoin="round"
        style={{
          fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif",
          fontSize: "148px",
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        FlowPay
      </text>
    </svg>
  )
}

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <WorkflowVisual />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-24 text-center">
        <div className="relative flex w-full flex-col items-center">
          <FlowPayWordmark />
          <h1 className="rx-rise-delay relative z-10 -mt-4 max-w-2xl font-heading text-2xl leading-snug tracking-tight text-[var(--rx-paper)] sm:-mt-6 sm:text-3xl md:-mt-8 md:text-4xl">
            From brief to approved content.
          </h1>
        </div>
        <p className="rx-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--rx-mist)]/90 sm:text-lg">
          Draft campaign copy and visuals, send them through review, and keep
          only approved assets in your library.
        </p>
        <div className="rx-rise-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-[var(--rx-signal)] px-6 text-[var(--rx-ink)] hover:bg-[var(--rx-signal)]/90"
          >
            <Link href={ROUTES.register}>Get started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full border-white/25 bg-transparent px-6 text-[var(--rx-paper)] hover:bg-white/10 hover:text-[var(--rx-paper)]"
          >
            <Link href={ROUTES.login}>Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
