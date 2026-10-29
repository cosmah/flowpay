"use client"

import Link from "next/link"
import { ApprovedBadge } from "@/components/library/approved-badge"
import { LibraryActions } from "@/components/library/library-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROUTES } from "@/lib/constants/routes"
import type { LibraryItem } from "@/types"

function excerpt(text: string, max = 90) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max).trimEnd()}…`
}

export function LibraryTable({ items }: { items: LibraryItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {/* Mobile: stacked rows (panda posts pattern) */}
      <ul className="divide-y divide-border/70 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="space-y-3 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {item.type}
              </span>
              <ApprovedBadge />
            </div>
            <div className="min-w-0">
              <Link
                href={ROUTES.libraryItem(item.id)}
                className="font-heading text-base text-[var(--rx-ink)] hover:underline"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.type === "graphic"
                  ? "Promotional graphic"
                  : excerpt(item.content, 90)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{item.campaignName}</span>
                <span>·</span>
                <span>{item.approvedBy}</span>
                <span className="tabular-nums">
                  {new Date(item.approvedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <LibraryActions item={item} />
          </li>
        ))}
      </ul>

      {/* Desktop / tablet: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[36%] px-5">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Approved by</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-0 px-5 whitespace-normal">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={ROUTES.libraryItem(item.id)}
                        className="truncate font-heading font-medium text-[var(--rx-ink)] hover:underline"
                      >
                        {item.title}
                      </Link>
                      <ApprovedBadge />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.type === "graphic"
                        ? "Promotional graphic"
                        : excerpt(item.content, 90)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {item.type}
                </TableCell>
                <TableCell className="max-w-[10rem] truncate">
                  {item.campaignName}
                </TableCell>
                <TableCell>{item.approvedBy}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {new Date(item.approvedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-5 text-right whitespace-nowrap">
                  <div className="inline-flex justify-end">
                    <LibraryActions item={item} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
