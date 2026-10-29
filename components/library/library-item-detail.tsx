"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"

export function LibraryItemDetail({ itemId }: { itemId: string }) {
  const { db } = useDb()
  const item = db.library.find((row) => row.id === itemId)
  const sends = db.testSends.filter((row) => row.libraryItemId === itemId)

  if (!item) {
    return (
      <EmptyState
        title="Asset not found"
        description="Only approved library items from the seeded H2 data are available here."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {item.format}
        </p>
        <h2 className="mt-1 font-heading text-xl text-[var(--rx-ink)]">
          {item.title}
        </h2>
        <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {item.content}
        </pre>
      </div>

      <section>
        <h3 className="mb-3 font-heading text-lg text-[var(--rx-ink)]">
          Test send log
        </h3>
        {sends.length === 0 ? (
          <EmptyState
            title="No test sends yet"
            description="Simulated sends will log here as submitted — not delivered."
          />
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {sends.map((send) => (
              <li key={send.id} className="px-5 py-4 text-sm">
                <p className="font-medium text-foreground">{send.message}</p>
                <p className="mt-1 text-muted-foreground">
                  {send.mode} · {send.result} ·{" "}
                  {new Date(send.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
