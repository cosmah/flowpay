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
export type ProfileRole = "marketer" | "reviewer"
export type ProfileStatus = "active" | "disabled"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: ProfileRole
          status: ProfileStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: ProfileRole
          status?: ProfileStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: ProfileRole
          status?: ProfileStatus
          created_at?: string
          updated_at?: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          objective: string
          audience: string
          product: string
          channel: string
          tone: string
          cta: string
          status?: CampaignRowStatus
          owner_email?: string | null
          reviewer_email?: string | null
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
          created_at: string
        }
        Insert: {
          id?: string
          content_item_id: string
          reviewer_email?: string | null
          decision: ReviewDecision
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_item_id?: string
          reviewer_email?: string | null
          decision?: ReviewDecision
          feedback?: string | null
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
          tags: string[] | null
          approved_at: string
          approved_by: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          content_item_id?: string | null
          type: ContentItemType
          title: string
          body: string
          graphic_url?: string | null
          tags?: string[] | null
          approved_at?: string
          approved_by?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          content_item_id?: string | null
          type?: ContentItemType
          title?: string
          body?: string
          graphic_url?: string | null
          tags?: string[] | null
          approved_at?: string
          approved_by?: string | null
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
