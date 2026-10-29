export type NotificationKind =
  | "task"
  | "review"
  | "library"
  | "team"
  | "system"

export interface AppNotification {
  id: string
  title: string
  summary: string
  body: string
  kind: NotificationKind
  createdAt: string
  readAt?: string
  href?: string
}
