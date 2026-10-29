"use client"

import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toUserMessage } from "@/lib/errors"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  error?: unknown
  description?: string
  onRetry?: () => void
  retryLabel?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

/**
 * Reusable user-facing error panel. Always sanitizes messages.
 */
export function ErrorState({
  title = "Something went wrong",
  error,
  description,
  onRetry,
  retryLabel = "Try again",
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  const message =
    description ?? (error !== undefined ? toUserMessage(error) : undefined)

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5",
        compact ? "px-4 py-5" : "px-6 py-10",
        className
      )}
    >
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <h2 className="font-heading text-lg tracking-tight">{title}</h2>
      </div>
      {message ? (
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  )
}
