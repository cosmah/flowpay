import {
  CheckCircle2,
  FilePenLine,
  Library,
  Sparkles,
  Workflow,
} from "lucide-react"

const STEPS = [
  { label: "Brief", icon: FilePenLine },
  { label: "Draft", icon: Sparkles },
  { label: "Review", icon: CheckCircle2 },
  { label: "Library", icon: Library },
] as const

export function CampaignCreateHero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-[var(--rx-ink)] px-6 py-8 text-[var(--rx-paper)] sm:px-8 sm:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 20%, color-mix(in oklab, var(--rx-lagoon) 55%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, color-mix(in oklab, var(--rx-signal) 35%, transparent), transparent 50%)",
        }}
      />
      <div className="relative z-10 max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--rx-mist)]/90">
          <Workflow className="size-3.5" aria-hidden />
          Campaign brief
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Shape the story before you ship the work.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--rx-mist)]/90 sm:text-base">
          A clear brief turns scattered ideas into drafts your team can review.
          Fill in the essentials—audience, offer, tone, and the action you want—
          then move into creation with confidence.
        </p>
        <ol className="mt-8 flex flex-wrap gap-2 sm:gap-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--rx-mist)]"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[10px]">
                  {index + 1}
                </span>
                <Icon className="size-3.5 opacity-80" aria-hidden />
                {step.label}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
