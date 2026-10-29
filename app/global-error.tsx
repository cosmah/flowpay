"use client"

import { useEffect } from "react"
import { Figtree, Syne } from "next/font/google"
import { toUserMessage } from "@/lib/errors"
import "./globals.css"

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
})

/**
 * Last-resort boundary when the root layout itself fails.
 * Must render its own <html> / <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[FlowPay global error]", error)
  }, [error])

  const message = toUserMessage(error)

  return (
    <html lang="en" className={`${figtree.variable} ${syne.variable} h-full`}>
      <body className="flex min-h-full flex-col items-center justify-center bg-[var(--rx-mist)] px-6 font-sans text-[var(--rx-ink)]">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-[var(--rx-paper)] px-6 py-8 shadow-sm">
          <p className="font-heading text-xl tracking-tight">FlowPay</p>
          <h1 className="mt-3 font-heading text-2xl tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--rx-ink)] px-4 text-sm font-medium text-[var(--rx-paper)]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
