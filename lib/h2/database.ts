import { cloneMockData } from "@/data"
import type {
  AuthUser,
  Campaign,
  CampaignBrief,
  CampaignStatus,
  Draft,
  LibraryItem,
  Project,
  ProjectStatus,
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

  connect(force = false): H2Snapshot {
    if (this.connected && !force) {
      return this.getSnapshot()
    }

    const seed = cloneMockData()
    this.snapshot = {
      projects: seed.projects,
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

  listProjects(): Project[] {
    return structuredClone(this.snapshot.projects)
  }

  getProject(id: string): Project | undefined {
    return structuredClone(this.snapshot.projects.find((p) => p.id === id))
  }

  createProject(input: {
    name: string
    description: string
    status?: ProjectStatus
    createdBy: string
  }): Project {
    const now = new Date().toISOString()
    const project: Project = {
      id: `proj_${crypto.randomUUID().slice(0, 8)}`,
      name: input.name,
      description: input.description,
      status: input.status ?? "active",
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    }
    this.snapshot.projects.unshift(project)
    return structuredClone(project)
  }

  updateProject(
    id: string,
    input: {
      name: string
      description: string
      status: ProjectStatus
    }
  ): Project | undefined {
    const index = this.snapshot.projects.findIndex((p) => p.id === id)
    if (index < 0) return undefined
    const current = this.snapshot.projects[index]
    const updated: Project = {
      ...current,
      name: input.name,
      description: input.description,
      status: input.status,
      updatedAt: new Date().toISOString(),
    }
    this.snapshot.projects[index] = updated
    return structuredClone(updated)
  }

  deleteProject(id: string): boolean {
    const before = this.snapshot.projects.length
    const campaignIds = this.snapshot.campaigns
      .filter((c) => c.projectId === id)
      .map((c) => c.id)

    this.snapshot.projects = this.snapshot.projects.filter((p) => p.id !== id)
    this.snapshot.campaigns = this.snapshot.campaigns.filter(
      (c) => c.projectId !== id
    )
    this.snapshot.drafts = this.snapshot.drafts.filter(
      (d) => !campaignIds.includes(d.campaignId)
    )
    this.snapshot.tasks = this.snapshot.tasks.filter(
      (t) => !campaignIds.includes(t.campaignId)
    )
    this.snapshot.library = this.snapshot.library.filter(
      (item) => !campaignIds.includes(item.campaignId)
    )
    return this.snapshot.projects.length < before
  }

  listCampaigns(projectId?: string): Campaign[] {
    const rows = projectId
      ? this.snapshot.campaigns.filter((c) => c.projectId === projectId)
      : this.snapshot.campaigns
    return structuredClone(rows)
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

  getDraft(id: string): Draft | undefined {
    return structuredClone(this.snapshot.drafts.find((d) => d.id === id))
  }

  submitDraft(id: string, authorName?: string): Draft | undefined {
    const index = this.snapshot.drafts.findIndex((d) => d.id === id)
    if (index < 0) return undefined
    const current = this.snapshot.drafts[index]
    if (current.status !== "draft" && current.status !== "changes_requested") {
      return undefined
    }
    const updated: Draft = {
      ...current,
      status: "in_review",
      authorName: authorName ?? current.authorName,
      updatedAt: new Date().toISOString(),
    }
    this.snapshot.drafts[index] = updated
    return structuredClone(updated)
  }

  requestDraftChanges(id: string, body: string): Draft | undefined {
    const index = this.snapshot.drafts.findIndex((d) => d.id === id)
    if (index < 0) return undefined
    const current = this.snapshot.drafts[index]
    if (current.status !== "in_review") return undefined
    const updated: Draft = {
      ...current,
      status: "changes_requested",
      reviewComments: [
        ...current.reviewComments,
        {
          id: `rc_${crypto.randomUUID().slice(0, 8)}`,
          authorRole: "reviewer",
          body,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }
    this.snapshot.drafts[index] = updated
    return structuredClone(updated)
  }

  approveDraft(id: string): Draft | undefined {
    const index = this.snapshot.drafts.findIndex((d) => d.id === id)
    if (index < 0) return undefined
    const current = this.snapshot.drafts[index]
    if (current.status !== "in_review") return undefined
    const updated: Draft = {
      ...current,
      status: "approved",
      updatedAt: new Date().toISOString(),
    }
    this.snapshot.drafts[index] = updated
    return structuredClone(updated)
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

  createCampaign(input: {
    projectId: string
    brief: CampaignBrief
    status?: CampaignStatus
    createdBy: string
  }): Campaign {
    const now = new Date().toISOString()
    const campaign: Campaign = {
      id: `camp_${crypto.randomUUID().slice(0, 8)}`,
      projectId: input.projectId,
      brief: structuredClone(input.brief),
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    }
    this.snapshot.campaigns.unshift(campaign)
    return structuredClone(campaign)
  }

  updateCampaign(
    id: string,
    input: {
      projectId: string
      brief: CampaignBrief
      status: CampaignStatus
    }
  ): Campaign | undefined {
    const index = this.snapshot.campaigns.findIndex((c) => c.id === id)
    if (index < 0) return undefined

    const current = this.snapshot.campaigns[index]
    const updated: Campaign = {
      ...current,
      projectId: input.projectId,
      brief: structuredClone(input.brief),
      status: input.status,
      updatedAt: new Date().toISOString(),
    }
    this.snapshot.campaigns[index] = updated
    return structuredClone(updated)
  }

  deleteCampaign(id: string): boolean {
    const before = this.snapshot.campaigns.length
    this.snapshot.campaigns = this.snapshot.campaigns.filter((c) => c.id !== id)
    this.snapshot.drafts = this.snapshot.drafts.filter((d) => d.campaignId !== id)
    this.snapshot.tasks = this.snapshot.tasks.filter((t) => t.campaignId !== id)
    this.snapshot.library = this.snapshot.library.filter(
      (item) => item.campaignId !== id
    )
    return this.snapshot.campaigns.length < before
  }
}

function emptySnapshot(): H2Snapshot {
  return {
    projects: [],
    campaigns: [],
    drafts: [],
    tasks: [],
    library: [],
    testSends: [],
    users: [],
  }
}

export const h2 = new H2Database()
