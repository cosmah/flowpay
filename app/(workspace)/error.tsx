"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared"
import { ROUTES } from "@/lib/constants/routes"
import { toUserMessage } from "@/lib/errors"

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[FlowPay workspace error]", error)
    }
  }, [error])

  return (
    <ErrorState
      title="Workspace error"
      description={toUserMessage(error)}
      onRetry={reset}
      action={
        <Button asChild variant="ghost">
          <Link href={ROUTES.campaigns}>Back to campaigns</Link>
        </Button>
      }
    />
  )
}
