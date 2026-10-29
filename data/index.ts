import type {
  AuthUser,
  Campaign,
  Draft,
  LibraryItem,
  Project,
  Task,
  TestSendLog,
} from "@/types"

import campaigns from "./campaigns.json"
import drafts from "./drafts.json"
import library from "./library.json"
import projects from "./projects.json"
import tasks from "./tasks.json"
import testSends from "./test-sends.json"
import users from "./users.json"

/** Canonical mock snapshot poured into the in-memory H2 DB on every browser reload. */
export const mockData = {
  projects: projects as Project[],
  campaigns: campaigns as Campaign[],
  drafts: drafts as Draft[],
  tasks: tasks as Task[],
  library: library as LibraryItem[],
  testSends: testSends as TestSendLog[],
  users: users as AuthUser[],
}

export type MockData = typeof mockData

export function cloneMockData(): MockData {
  return structuredClone(mockData)
}
