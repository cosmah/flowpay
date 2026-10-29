"use client"

import Link from "next/link"
import { EmptyState } from "@/components/shared/empty-state"
import { useDb } from "@/hooks/use-db"
import { ROUTES } from "@/lib/constants/routes"

export function LibraryList() {
  const { db } = useDb()
  const items = db.library

  if (items.length === 0) {
    return (
      <EmptyState
        title="No approved assets"
        description="Drafts never appear here. Once a reviewer approves content, it shows up for export and test send."
      />
    )
  }

  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={ROUTES.libraryItem(item.id)}
            className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-muted/40"
          >
            <p className="font-heading text-base text-[var(--rx-ink)]">
              {item.title}
            </p>
            <p className="text-sm capitalize text-muted-foreground">
              {item.format} · Approved{" "}
              {new Date(item.approvedAt).toLocaleDateString()}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
