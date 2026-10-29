"use client"

import Link from "next/link"
import { FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

/** Top-bar workspace label (projects table is not in Supabase). */
export function ProjectSwitcher() {
  return (
    <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
      <Link href={ROUTES.campaigns}>
        <FolderKanban className="size-3.5 shrink-0" />
        <span className="truncate">Campaigns</span>
      </Link>
    </Button>
  )
}
