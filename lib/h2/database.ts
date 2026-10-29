import { cloneMockData } from "@/data"
import type {
  AuthUser,
  Campaign,
  Draft,
  LibraryItem,
  Task,
  TestSendLog,
  UserRole,
} from "@/types"
import type { H2Snapshot } from "./types"

/**
 * Browser-side in-memory H2 stand-in for the FlowPay demo.
 * Reseeds from `/data` whenever `connect()` runs (every page load).
 */
class H2Database {
  private snapshot: H2Snapshot = emptySnapshot()
  private seededAt: string | null = null
  private connected = false

  /**
   * Pour `/data` mock rows once per browser load.
   * Soft re-entry (SPA navigation / second provider) keeps runtime writes
   * such as newly registered users.
   */
  connect(force = false): H2Snapshot {
    if (this.connected && !force) {
      return this.getSnapshot()
    }

    const seed = cloneMockData()
    this.snapshot = {
      campaigns: seed.campaigns,
      drafts: seed.drafts,
      tasks: seed.tasks,
      library: seed.library,
      testSends: seed.testSends,
      users: seed.users,
    }
    this.seededAt = new Date().toISOString()
    this.connected = true
    return this.getSnapshot()
  }

  getSeededAt() {
    return this.seededAt
  }

  getSnapshot(): H2Snapshot {
    return structuredClone(this.snapshot)
  }

  listCampaigns(): Campaign[] {
    return structuredClone(this.snapshot.campaigns)
  }

  getCampaign(id: string): Campaign | undefined {
    return structuredClone(this.snapshot.campaigns.find((c) => c.id === id))
  }

  listDrafts(campaignId?: string): Draft[] {
    const rows = campaignId
      ? this.snapshot.drafts.filter((d) => d.campaignId === campaignId)
      : this.snapshot.drafts
    return structuredClone(rows)
  }

  listTasks(): Task[] {
    return structuredClone(this.snapshot.tasks)
  }

  listLibrary(): LibraryItem[] {
    return structuredClone(this.snapshot.library)
  }

  getLibraryItem(id: string): LibraryItem | undefined {
    return structuredClone(this.snapshot.library.find((item) => item.id === id))
  }

  listTestSends(libraryItemId?: string): TestSendLog[] {
    const rows = libraryItemId
      ? this.snapshot.testSends.filter((t) => t.libraryItemId === libraryItemId)
      : this.snapshot.testSends
    return structuredClone(rows)
  }

  listReviewQueue(): Draft[] {
    return structuredClone(
      this.snapshot.drafts.filter((d) => d.status === "in_review")
    )
  }

  listUsers(): AuthUser[] {
    return structuredClone(this.snapshot.users)
  }

  findUserByEmail(email: string): AuthUser | undefined {
    const normalized = email.trim().toLowerCase()
    return structuredClone(
      this.snapshot.users.find((user) => user.email.toLowerCase() === normalized)
    )
  }

  createUser(input: {
    name: string
    email: string
    password: string
    role: UserRole
  }): AuthUser {
    const user: AuthUser = {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
      role: input.role,
      createdAt: new Date().toISOString(),
    }
    this.snapshot.users.push(user)
    return structuredClone(user)
  }
}

function emptySnapshot(): H2Snapshot {
  return {
    campaigns: [],
    drafts: [],
    tasks: [],
    library: [],
    testSends: [],
    users: [],
  }
}

export const h2 = new H2Database()
