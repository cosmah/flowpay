export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CampaignRowStatus = "draft" | "in_review" | "approved" | "archived"
export type ContentItemType = "social_caption" | "email" | "graphic"
export type ContentItemStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
export type TaskRowStatus = "pending" | "in_progress" | "completed" | "blocked"
export type ReviewDecision = "approved" | "changes_requested"
export type ProfileRole = "admin" | "marketer" | "reviewer"
export type ProfileStatus = "active" | "disabled"
export type InvitationStatus = "pending" | "accepted" | "revoked"

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string
          status: "active" | "paused" | "archived"
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string
          status?: "active" | "paused" | "archived"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string
          status?: "active" | "paused" | "archived"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: ProfileRole
          status: ProfileStatus
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: ProfileRole
          status?: ProfileStatus
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: ProfileRole
          status?: ProfileStatus
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          company_id: string
          email: string
          role: ProfileRole
          invited_by: string | null
          token: string
          status: InvitationStatus
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          role: ProfileRole
          invited_by?: string | null
          token?: string
          status?: InvitationStatus
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          role?: ProfileRole
          invited_by?: string | null
          token?: string
          status?: InvitationStatus
          created_at?: string
          accepted_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          title: string
          objective: string
          audience: string
          product: string
          channel: string
          tone: string
          cta: string
          status: CampaignRowStatus
          owner_email: string | null
          reviewer_email: string | null
          company_id: string | null
          project_id: string | null
          banner_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          objective: string
          audience?: string
          product?: string
          channel: string
          tone?: string
          cta?: string
          status?: CampaignRowStatus
          owner_email?: string | null
          reviewer_email?: string | null
          company_id?: string | null
          project_id?: string | null
          banner_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          objective?: string
          audience?: string
          product?: string
          channel?: string
          tone?: string
          cta?: string
          status?: CampaignRowStatus
          owner_email?: string | null
          reviewer_email?: string | null
          company_id?: string | null
          project_id?: string | null
          banner_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          id: string
          campaign_id: string
          type: ContentItemType
          title: string
          body: string
          graphic_url: string | null
          status: ContentItemStatus
          version: number
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          type: ContentItemType
          title: string
          body: string
          graphic_url?: string | null
          status?: ContentItemStatus
          version?: number
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          type?: ContentItemType
          title?: string
          body?: string
          graphic_url?: string | null
          status?: ContentItemStatus
          version?: number
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          content_item_id: string
          reviewer_email: string | null
          decision: ReviewDecision
          feedback: string | null
          company_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_item_id: string
          reviewer_email?: string | null
          decision: ReviewDecision
          feedback?: string | null
          company_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_item_id?: string
          reviewer_email?: string | null
          decision?: ReviewDecision
          feedback?: string | null
          company_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          campaign_id: string
          content_item_id: string | null
          title: string
          owner_email: string | null
          due_date: string | null
          status: TaskRowStatus
          automated: boolean
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          content_item_id?: string | null
          title: string
          owner_email?: string | null
          due_date?: string | null
          status?: TaskRowStatus
          automated?: boolean
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          content_item_id?: string | null
          title?: string
          owner_email?: string | null
          due_date?: string | null
          status?: TaskRowStatus
          automated?: boolean
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      library: {
        Row: {
          id: string
          campaign_id: string
          content_item_id: string | null
          type: ContentItemType
          title: string
          body: string
          graphic_url: string | null
          channel: string | null
          tags: string[] | null
          approved_at: string
          approved_by: string | null
          company_id: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          content_item_id?: string | null
          type: ContentItemType
          title: string
          body: string
          graphic_url?: string | null
          channel?: string | null
          tags?: string[] | null
          approved_at?: string
          approved_by?: string | null
          company_id?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          content_item_id?: string | null
          type?: ContentItemType
          title?: string
          body?: string
          graphic_url?: string | null
          channel?: string | null
          tags?: string[] | null
          approved_at?: string
          approved_by?: string | null
          company_id?: string | null
        }
        Relationships: []
      }
      test_sends: {
        Row: {
          id: string
          library_item_id: string
          campaign_id: string | null
          content_type: string | null
          title: string | null
          sent_to: string | null
          method: string
          status: string
          error_message: string | null
          sent_at: string
          company_id: string | null
        }
        Insert: {
          id?: string
          library_item_id: string
          campaign_id?: string | null
          content_type?: string | null
          title?: string | null
          sent_to?: string | null
          method?: string
          status?: string
          error_message?: string | null
          sent_at?: string
          company_id?: string | null
        }
        Update: {
          id?: string
          library_item_id?: string
          campaign_id?: string | null
          content_type?: string | null
          title?: string | null
          sent_to?: string | null
          method?: string
          status?: string
          error_message?: string | null
          sent_at?: string
          company_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
