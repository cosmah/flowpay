"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared"
import { ROUTES } from "@/lib/constants/routes"
import { toUserMessage } from "@/lib/errors"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[FlowPay route error]", error)
    }
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--rx-mist)] px-6 py-16">
      <div className="w-full max-w-lg">
        <ErrorState
          title="We hit a snag"
          description={toUserMessage(error)}
          onRetry={reset}
          action={
            <Button asChild variant="ghost">
              <Link href={ROUTES.home}>Back to home</Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
