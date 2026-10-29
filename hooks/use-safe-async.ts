"use client"

import { useCallback, useState } from "react"
import { handleClientError, runSafe } from "@/lib/errors"

/**
 * Reusable async runner with safe user messaging + loading flag.
 */
export function useSafeAsync() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      options?: Parameters<typeof runSafe<T>>[1]
    ) => {
      setPending(true)
      setError(null)
      const result = await runSafe(action, {
        toast: options?.toast ?? true,
        ...options,
        onError: (message) => {
          setError(message)
          options?.onError?.(message)
        },
      })
      setPending(false)
      return result
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  const capture = useCallback((err: unknown, fallback?: string) => {
    const message = handleClientError(err, { fallback, toast: true })
    setError(message)
    return message
  }, [])

  return { run, pending, error, clearError, capture }
}
