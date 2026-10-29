import { LandingHero } from "@/components/landing/hero"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--rx-paper)]">
      <LandingHero />

      <section
        id="features"
        className="scroll-mt-24 border-t border-[var(--rx-ink)]/10 bg-[var(--rx-mist)]/50"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="font-heading text-2xl tracking-tight text-[var(--rx-ink)] sm:text-3xl">
            Built for the campaign loop
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            FlowPay keeps briefs, drafts, review tasks, and the approved library
            in one workspace — with clear status at every step.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Brief validation",
                body: "Missing fields surface clear messages before you generate.",
              },
              {
                title: "Review automation",
                body: "Submitting a draft creates a reviewer task due in 24 hours.",
              },
              {
                title: "Approved library",
                body: "Drafts never leak in. Copy, download, or simulate a test send.",
              },
            ].map((item) => (
              <li key={item.title} className="border-t border-[var(--rx-ink)]/15 pt-4">
                <p className="font-heading text-lg text-[var(--rx-ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="font-heading text-2xl tracking-tight text-[var(--rx-ink)] sm:text-3xl">
            One path from brief to library
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Marketers write the brief and refine drafts. Reviewers approve or send
            changes back. Only approved items land in the library.
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Brief", body: "Capture the campaign with clear validation." },
              { step: "02", title: "Generate", body: "Two text formats plus one visual draft." },
              { step: "03", title: "Review", body: "Approve or request changes with history." },
              { step: "04", title: "Library", body: "Search, export, and test approved assets." },
            ].map((item) => (
              <li key={item.step} className="border-t border-[var(--rx-ink)]/15 pt-4">
                <p className="font-mono text-xs tracking-widest text-[var(--rx-lagoon)]">
                  {item.step}
                </p>
                <p className="mt-2 font-heading text-lg text-[var(--rx-ink)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
