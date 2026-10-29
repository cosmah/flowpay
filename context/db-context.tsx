"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import {
  campaignBriefToRow,
  campaignFromRow,
  channelsFromDb,
  draftFromContentItem,
  libraryFromRow,
  projectFromRow,
  taskFromRow,
  taskStatusToRow,
  testSendFromRow,
} from "@/lib/supabase/mappers"
import type {
  Campaign,
  CampaignBrief,
  CampaignStatus,
  Draft,
  LibraryItem,
  Project,
  Task,
  TestSendLog,
} from "@/types"

export type DbSnapshot = {
  projects: Project[]
  campaigns: Campaign[]
  drafts: Draft[]
  tasks: Task[]
  library: LibraryItem[]
  testSends: TestSendLog[]
}

interface DbContextValue {
  db: DbSnapshot
  seededAt: string | null
  loading: boolean
  refresh: () => Promise<void>
  createProject: (input: {
    name: string
    description: string
    status?: Project["status"]
    createdBy: string
  }) => Promise<Project | { error: string }>
  updateProject: (
    id: string,
    input: { name: string; description: string; status: Project["status"] }
  ) => Promise<Project | undefined>
  deleteProject: (id: string) => Promise<boolean>
  createCampaign: (input: {
    projectId: string
    brief: CampaignBrief
    status?: CampaignStatus
    createdBy: string
    reviewerEmail?: string
  }) => Promise<Campaign | { error: string }>
  updateCampaign: (
    id: string,
    input: {
      projectId: string
      brief: CampaignBrief
      status: CampaignStatus
    }
  ) => Promise<Campaign | undefined>
  deleteCampaign: (id: string) => Promise<boolean>
  submitDraft: (
    id: string,
    reviewerEmail?: string
  ) => Promise<Draft | undefined>
  requestDraftChanges: (
    id: string,
    body: string,
    reviewerEmail?: string,
    authorEmail?: string
  ) => Promise<Draft | undefined>
  approveDraft: (
    id: string,
    reviewerEmail?: string
  ) => Promise<Draft | undefined>
  updateDraftContent: (
    id: string,
    content: string
  ) => Promise<Draft | undefined>
}

const emptyDb: DbSnapshot = {
  projects: [],
  campaigns: [],
  drafts: [],
  tasks: [],
  library: [],
  testSends: [],
}

const DbContext = createContext<DbContextValue | null>(null)

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DbSnapshot>(emptyDb)
  const [seededAt, setSeededAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setDb(emptyDb)
      setSeededAt(null)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle()

    const companyId = profile?.company_id
    if (!companyId) {
      setDb(emptyDb)
      setSeededAt(null)
      setLoading(false)
      return
    }

    const [
      projectsRes,
      campaignsRes,
      contentRes,
      reviewsRes,
      tasksRes,
      libraryRes,
      sendsRes,
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("content_items")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("library")
        .select("*")
        .eq("company_id", companyId)
        .order("approved_at", { ascending: false }),
      supabase
        .from("test_sends")
        .select("*")
        .eq("company_id", companyId)
        .order("sent_at", { ascending: false }),
    ])

    const campaignRows = campaignsRes.data ?? []
    const campaignNameById = new Map(
      campaignRows.map((row) => [row.id, row.title] as const)
    )
    const reviewRows = reviewsRes.data ?? []

    setDb({
      projects: (projectsRes.data ?? []).map(projectFromRow),
      campaigns: campaignRows.map(campaignFromRow),
      drafts: (contentRes.data ?? []).map((row) =>
        draftFromContentItem(row, reviewRows)
      ),
      tasks: (tasksRes.data ?? []).map(taskFromRow),
      library: (libraryRes.data ?? []).map((row) =>
        libraryFromRow(row, campaignNameById.get(row.campaign_id) ?? "Campaign")
      ),
      testSends: (sendsRes.data ?? []).map(testSendFromRow),
    })
    setSeededAt(new Date().toISOString())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createProject = useCallback(
    async (input: {
      name: string
      description: string
      status?: Project["status"]
      createdBy: string
    }) => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null }

      if (!profile?.company_id) {
        return { error: "Join or create a company before adding projects." }
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          company_id: profile.company_id,
          name: input.name,
          description: input.description,
          status: input.status ?? "active",
          created_by: input.createdBy,
        })
        .select("*")
        .single()

      if (error || !data) {
        return { error: error?.message ?? "Could not create project." }
      }
      await refresh()
      return projectFromRow(data)
    },
    [refresh]
  )

  const updateProject = useCallback(
    async (
      id: string,
      input: { name: string; description: string; status: Project["status"] }
    ) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("projects")
        .update({
          name: input.name,
          description: input.description,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return undefined
      await refresh()
      return projectFromRow(data)
    },
    [refresh]
  )

  const deleteProject = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) return false
      await refresh()
      return true
    },
    [refresh]
  )

  const createCampaign = useCallback(
    async (input: {
      projectId: string
      brief: CampaignBrief
      status?: CampaignStatus
      createdBy: string
      reviewerEmail?: string
    }) => {
      if (!input.projectId) {
        return { error: "Select a project for this campaign." }
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null }

      if (!profile?.company_id) {
        return { error: "Join or create a company before adding campaigns." }
      }

      const companyId = profile.company_id
      const { data: project } = await supabase
        .from("projects")
        .select("id, company_id")
        .eq("id", input.projectId)
        .eq("company_id", companyId)
        .maybeSingle()

      if (!project) {
        return { error: "Select a project from your company." }
      }

      const payload = {
        ...campaignBriefToRow(input.brief),
        status: (input.status ?? "draft") as "draft",
        owner_email: input.createdBy.includes("@")
          ? input.createdBy
          : undefined,
        reviewer_email: input.reviewerEmail ?? null,
        company_id: companyId,
        project_id: input.projectId,
      }

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert(payload)
        .select("*")
        .single()

      if (error || !campaign) {
        return { error: error?.message ?? "Could not create campaign." }
      }

      const primaryImage = input.brief.imageUrls[0] ?? null
      const { data: contentItems } = await supabase
        .from("content_items")
        .insert({
          campaign_id: campaign.id,
          type: "social_caption" as const,
          title: input.brief.title,
          body: input.brief.content,
          graphic_url: primaryImage,
          status: "draft" as const,
          version: 1,
          company_id: companyId,
        })
        .select("*")

      if (contentItems?.length) {
        const due = new Date()
        due.setDate(due.getDate() + 1)
        await supabase.from("tasks").insert(
          contentItems.map((item) => ({
            campaign_id: campaign.id,
            content_item_id: item.id,
            title: `Review & submit post`,
            owner_email: payload.owner_email ?? null,
            due_date: due.toISOString().slice(0, 10),
            status: "pending" as const,
            automated: true,
            company_id: companyId,
          }))
        )
      }

      await refresh()
      return campaignFromRow(campaign)
    },
    [refresh]
  )

  const updateCampaign = useCallback(
    async (
      id: string,
      input: {
        projectId: string
        brief: CampaignBrief
        status: CampaignStatus
      }
    ) => {
      const supabase = createClient()
      if (!input.projectId) return undefined

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null }

      if (!profile?.company_id) return undefined

      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("company_id", profile.company_id)
        .maybeSingle()

      if (!project) return undefined

      const status =
        input.status === "changes_requested" ? "in_review" : input.status
      const { data, error } = await supabase
        .from("campaigns")
        .update({
          ...campaignBriefToRow(input.brief),
          status,
          project_id: input.projectId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("company_id", profile.company_id)
        .select("*")
        .single()
      if (error || !data) return undefined

      const primaryImage = input.brief.imageUrls[0] ?? null
      await supabase
        .from("content_items")
        .update({
          title: input.brief.title,
          body: input.brief.content,
          graphic_url: primaryImage,
          updated_at: new Date().toISOString(),
        })
        .eq("campaign_id", id)
        .eq("type", "social_caption")

      await refresh()
      return campaignFromRow(data)
    },
    [refresh]
  )

  const deleteCampaign = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from("campaigns").delete().eq("id", id)
      if (error) return false
      await refresh()
      return true
    },
    [refresh]
  )

  const submitDraft = useCallback(
    async (id: string, reviewerEmail?: string) => {
      const supabase = createClient()
      const due = new Date()
      due.setHours(due.getHours() + 24)

      const { data, error } = await supabase
        .from("content_items")
        .update({
          status: "in_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error || !data) return undefined

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("reviewer_email")
        .eq("id", data.campaign_id)
        .maybeSingle()

      const ownerEmail =
        reviewerEmail?.includes("@")
          ? reviewerEmail
          : campaign?.reviewer_email?.includes("@")
            ? campaign.reviewer_email
            : null

      await supabase
        .from("campaigns")
        .update({ status: "in_review" })
        .eq("id", data.campaign_id)

      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id")
        .eq("content_item_id", id)
        .in("status", ["pending", "in_progress", "blocked"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "pending",
            due_date: due.toISOString().slice(0, 10),
            title: `Review: ${data.title}`,
            owner_email: ownerEmail,
            automated: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTask.id)
      } else {
        await supabase.from("tasks").insert({
          campaign_id: data.campaign_id,
          content_item_id: id,
          title: `Review: ${data.title}`,
          owner_email: ownerEmail,
          due_date: due.toISOString().slice(0, 10),
          status: "pending",
          automated: true,
          company_id: data.company_id,
        })
      }

      await refresh()
      return draftFromContentItem(data)
    },
    [refresh]
  )

  const requestDraftChanges = useCallback(
    async (
      id: string,
      body: string,
      reviewerEmail?: string,
      authorEmail?: string
    ) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_items")
        .update({
          status: "changes_requested",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return undefined

      await supabase.from("reviews").insert({
        content_item_id: id,
        decision: "changes_requested",
        feedback: body,
        reviewer_email: reviewerEmail ?? null,
        company_id: data.company_id,
      })

      await supabase
        .from("tasks")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("content_item_id", id)
        .in("status", ["pending", "in_progress", "blocked"])

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("owner_email")
        .eq("id", data.campaign_id)
        .maybeSingle()

      const reviseOwner =
        authorEmail?.includes("@")
          ? authorEmail
          : campaign?.owner_email?.includes("@")
            ? campaign.owner_email
            : null

      const due = new Date()
      due.setDate(due.getDate() + 1)

      await supabase.from("tasks").insert({
        campaign_id: data.campaign_id,
        content_item_id: id,
        title: `Revise: ${data.title}`,
        owner_email: reviseOwner,
        due_date: due.toISOString().slice(0, 10),
        status: "pending",
        automated: true,
        company_id: data.company_id,
      })

      await refresh()
      return draftFromContentItem(data)
    },
    [refresh]
  )

  const approveDraft = useCallback(
    async (id: string, reviewerEmail?: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_items")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return undefined

      await supabase.from("reviews").insert({
        content_item_id: id,
        decision: "approved",
        feedback: "Approved",
        reviewer_email: reviewerEmail ?? null,
        company_id: data.company_id,
      })

      await supabase
        .from("tasks")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("content_item_id", id)

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title, channel, banner_urls")
        .eq("id", data.campaign_id)
        .maybeSingle()

      const channelList = channelsFromDb(campaign?.channel ?? "web")
      const graphicUrl =
        data.graphic_url ?? campaign?.banner_urls?.[0] ?? null
      const approvedAt = new Date().toISOString()
      const libraryRows = channelList.map((channel) => ({
        campaign_id: data.campaign_id,
        content_item_id: data.id,
        type: data.type,
        title: `${data.title} · ${channel}`,
        body: data.body,
        graphic_url: graphicUrl,
        channel,
        tags: [data.type, channel, campaign?.title ?? "campaign"],
        approved_by: reviewerEmail ?? "reviewer",
        approved_at: approvedAt,
        company_id: data.company_id,
      }))

      await supabase.from("library").insert(libraryRows)

      const { data: siblings } = await supabase
        .from("content_items")
        .select("status")
        .eq("campaign_id", data.campaign_id)

      if (siblings?.every((item) => item.status === "approved")) {
        await supabase
          .from("campaigns")
          .update({ status: "approved" })
          .eq("id", data.campaign_id)
      }

      await refresh()
      return draftFromContentItem(data)
    },
    [refresh]
  )

  const updateDraftContent = useCallback(
    async (id: string, content: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_items")
        .update({ body: content, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return undefined
      await refresh()
      return draftFromContentItem(data)
    },
    [refresh]
  )

  const value = useMemo<DbContextValue>(
    () => ({
      db,
      seededAt,
      loading,
      refresh,
      createProject,
      updateProject,
      deleteProject,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      submitDraft,
      requestDraftChanges,
      approveDraft,
      updateDraftContent,
    }),
    [
      db,
      seededAt,
      loading,
      refresh,
      createProject,
      updateProject,
      deleteProject,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      submitDraft,
      requestDraftChanges,
      approveDraft,
      updateDraftContent,
    ]
  )

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}

export function useDb() {
  const ctx = useContext(DbContext)
  if (!ctx) {
    throw new Error("useDb must be used within DbProvider")
  }
  return ctx
}
