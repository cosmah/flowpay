"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { toUserMessage } from "@/lib/errors"

type Props = {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  /** Soft boundary title shown to users. */
  title?: string
}

type State = {
  error: Error | null
}

/**
 * Catch render crashes in a subtree and show a safe recovery UI.
 * Use around risky client islands; route-level `error.tsx` covers pages.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[FlowPay ErrorBoundary]", error, info)
    }
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <ErrorState
        title={this.props.title ?? "This section failed to load"}
        description={toUserMessage(this.state.error)}
        onRetry={this.reset}
      />
    )
  }
}
