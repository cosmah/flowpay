import type {
  AuthUser,
  Campaign,
  Draft,
  LibraryItem,
  Task,
  TestSendLog,
} from "@/types"

export type H2TableName =
  | "campaigns"
  | "drafts"
  | "tasks"
  | "library"
  | "test_sends"
  | "users"

export interface H2Snapshot {
  campaigns: Campaign[]
  drafts: Draft[]
  tasks: Task[]
  library: LibraryItem[]
  testSends: TestSendLog[]
  users: AuthUser[]
}
