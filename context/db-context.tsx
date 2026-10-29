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
  defaultContentBodies,
  draftFromContentItem,
  libraryFromRow,
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
  }) => Project
  updateProject: (
    id: string,
    input: { name: string; description: string; status: Project["status"] }
  ) => Project | undefined
  deleteProject: (id: string) => boolean
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
    authorName?: string
  ) => Promise<Draft | undefined>
  requestDraftChanges: (
    id: string,
    body: string,
    reviewerEmail?: string
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
    const [
      campaignsRes,
      contentRes,
      tasksRes,
      libraryRes,
      sendsRes,
    ] = await Promise.all([
      supabase.from("campaigns").select("*").order("updated_at", { ascending: false }),
      supabase.from("content_items").select("*").order("updated_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("library").select("*").order("approved_at", { ascending: false }),
      supabase.from("test_sends").select("*").order("sent_at", { ascending: false }),
    ])

    const campaignRows = campaignsRes.data ?? []
    const campaignNameById = new Map(
      campaignRows.map((row) => [row.id, row.title] as const)
    )

    setDb({
      projects: [],
      campaigns: campaignRows.map(campaignFromRow),
      drafts: (contentRes.data ?? []).map(draftFromContentItem),
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
    (input: {
      name: string
      description: string
      status?: Project["status"]
      createdBy: string
    }): Project => {
      const now = new Date().toISOString()
      return {
        id: `local_${crypto.randomUUID().slice(0, 8)}`,
        name: input.name,
        description: input.description,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
        createdBy: input.createdBy,
      }
    },
    []
  )

  const updateProject = useCallback(() => undefined, [])
  const deleteProject = useCallback(() => false, [])

  const createCampaign = useCallback(
    async (input: {
      projectId: string
      brief: CampaignBrief
      status?: CampaignStatus
      createdBy: string
      reviewerEmail?: string
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
        return { error: "Join or create a company before adding campaigns." }
      }

      const companyId = profile.company_id
      const payload = {
        ...campaignBriefToRow(input.brief),
        status: (input.status ?? "draft") as "draft",
        owner_email: input.createdBy.includes("@")
          ? input.createdBy
          : undefined,
        reviewer_email: input.reviewerEmail ?? null,
        company_id: companyId,
      }

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert(payload)
        .select("*")
        .single()

      if (error || !campaign) {
        return { error: error?.message ?? "Could not create campaign." }
      }

      const bodies = defaultContentBodies(input.brief)
      const contentRows = (
        [
          ["social_caption", `${input.brief.productService} — Social Caption`, bodies.social_caption],
          ["email", `${input.brief.productService} — Email`, bodies.email],
          ["graphic", `${input.brief.productService} — Graphic`, bodies.graphic],
        ] as const
      ).map(([type, title, body]) => ({
        campaign_id: campaign.id,
        type,
        title,
        body,
        status: "draft" as const,
        version: 1,
        company_id: companyId,
      }))

      const { data: contentItems } = await supabase
        .from("content_items")
        .insert(contentRows)
        .select("*")

      if (contentItems?.length) {
        const due = new Date()
        due.setDate(due.getDate() + 1)
        await supabase.from("tasks").insert(
          contentItems.map((item) => ({
            campaign_id: campaign.id,
            content_item_id: item.id,
            title: `Review & submit ${item.type.replace("_", " ")}`,
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
      const status =
        input.status === "changes_requested" ? "in_review" : input.status
      const { data, error } = await supabase
        .from("campaigns")
        .update({
          ...campaignBriefToRow(input.brief),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single()
      if (error || !data) return undefined
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
    async (id: string, authorName?: string) => {
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

      await supabase.from("campaigns").update({ status: "in_review" }).eq("id", data.campaign_id)

      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id")
        .eq("content_item_id", id)
        .maybeSingle()

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "pending",
            due_date: due.toISOString().slice(0, 10),
            title: `Review: ${data.title}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTask.id)
      } else {
        await supabase.from("tasks").insert({
          campaign_id: data.campaign_id,
          content_item_id: id,
          title: `Review: ${data.title}`,
          owner_email: authorName?.includes("@") ? authorName : null,
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
    async (id: string, body: string, reviewerEmail?: string) => {
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
        .select("title")
        .eq("id", data.campaign_id)
        .maybeSingle()

      await supabase.from("library").insert({
        campaign_id: data.campaign_id,
        content_item_id: data.id,
        type: data.type,
        title: data.title,
        body: data.body,
        graphic_url: data.graphic_url,
        tags: [data.type, campaign?.title ?? "campaign"],
        approved_by: reviewerEmail ?? "reviewer",
        approved_at: new Date().toISOString(),
        company_id: data.company_id,
      })

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
