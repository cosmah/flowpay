/**
 * Turn any thrown value into a short, human-readable message.
 * Never expose stacks, HTML, or raw engine syntax to the UI.
 */

const FALLBACK = "Something went wrong. Please try again."

const TECHNICAL_PATTERNS = [
  /at\s+\S+\s+\(/i,
  /TypeError:/i,
  /ReferenceError:/i,
  /SyntaxError:/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /Unexpected token/i,
  /Cannot read propert/i,
  /is not a function/i,
  /\[object \w+\]/,
  /<[^>]+>/,
  /node_modules/i,
  /webpack/i,
  /digest:/i,
]

export function sanitizeUserText(value: string, max = 180): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function looksTechnical(message: string) {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message))
}

function fromAxiosLike(error: unknown): string | null {
  if (!error || typeof error !== "object") return null

  const maybe = error as {
    isAxiosError?: boolean
    response?: { status?: number; data?: { message?: string; error?: string } }
    code?: string
    message?: string
  }

  if (!maybe.isAxiosError && maybe.code !== "ERR_NETWORK") {
    // Still accept plain response-shaped objects from our api client.
    if (!maybe.response && maybe.code !== "ECONNABORTED") return null
  }

  const status = maybe.response?.status
  const serverMessage =
    maybe.response?.data?.message ?? maybe.response?.data?.error

  if (typeof serverMessage === "string") {
    const cleaned = sanitizeUserText(serverMessage)
    if (cleaned && !looksTechnical(cleaned)) return cleaned
  }

  if (maybe.code === "ECONNABORTED") {
    return "The request timed out. Please try again."
  }

  if (maybe.code === "ERR_NETWORK" || status === 0) {
    return "Network issue. Check your connection and try again."
  }

  if (status === 400) return "Some details look invalid. Check the form and try again."
  if (status === 401) return "Please log in again to continue."
  if (status === 403) return "You don’t have permission to do that."
  if (status === 404) return "We couldn’t find what you were looking for."
  if (status === 409) return "That conflicts with existing data. Refresh and try again."
  if (status === 422) return "Please fix the highlighted fields and try again."
  if (status && status >= 500) {
    return "The server had a problem. Please try again in a moment."
  }

  return null
}

export function toUserMessage(
  error: unknown,
  fallback: string = FALLBACK
): string {
  if (error == null || error === "") return fallback

  const axiosMessage = fromAxiosLike(error)
  if (axiosMessage) return axiosMessage

  if (typeof error === "string") {
    const cleaned = sanitizeUserText(error)
    if (!cleaned || looksTechnical(cleaned)) return fallback
    return cleaned
  }

  if (error instanceof Error) {
    const cleaned = sanitizeUserText(error.message)
    if (!cleaned || looksTechnical(cleaned)) {
      if (error.name === "AbortError") {
        return "The request was cancelled. Please try again."
      }
      return fallback
    }
    return cleaned
  }

  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string") {
      const cleaned = sanitizeUserText(message)
      if (cleaned && !looksTechnical(cleaned)) return cleaned
    }
  }

  return fallback
}

export const USER_ERROR_FALLBACK = FALLBACK
