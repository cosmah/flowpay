import type {
  AuthUser,
  Campaign,
  Draft,
  LibraryItem,
  Project,
  Task,
  TestSendLog,
} from "@/types"

export type H2TableName =
  | "projects"
  | "campaigns"
  | "drafts"
  | "tasks"
  | "library"
  | "test_sends"
  | "users"

export interface H2Snapshot {
  projects: Project[]
  campaigns: Campaign[]
  drafts: Draft[]
  tasks: Task[]
  library: LibraryItem[]
  testSends: TestSendLog[]
  users: AuthUser[]
}
