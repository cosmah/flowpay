import { toast } from "sonner"
import { toUserMessage } from "./format"

type HandleOptions = {
  /** Shown when the error has no safe message. */
  fallback?: string
  /** Toast the friendly message (default true). */
  toast?: boolean
  /** Optional toast title. */
  title?: string
  /** Log the raw error in development. */
  log?: boolean
}

/**
 * Normalize any failure for UI use. Returns a safe message and optionally toasts it.
 */
export function handleClientError(
  error: unknown,
  options: HandleOptions = {}
): string {
  const {
    fallback,
    toast: shouldToast = true,
    title,
    log = process.env.NODE_ENV !== "production",
  } = options

  if (log) {
    console.error("[FlowPay]", error)
  }

  const message = toUserMessage(error, fallback)

  if (shouldToast) {
    if (title) toast.error(title, { description: message })
    else toast.error(message)
  }

  return message
}

/**
 * Wrap async work so callers never surface raw exceptions to the UI.
 */
export async function runSafe<T>(
  action: () => Promise<T>,
  options?: HandleOptions & { onError?: (message: string) => void }
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const data = await action()
    return { ok: true, data }
  } catch (error) {
    const message = handleClientError(error, options)
    options?.onError?.(message)
    return { ok: false, message }
  }
}
