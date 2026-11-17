export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_reports: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reports_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          id: string
          invite_token: string
          is_test: boolean
          name: string
          required_email_domain: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_token?: string
          is_test?: boolean
          name: string
          required_email_domain?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_token?: string
          is_test?: boolean
          name?: string
          required_email_domain?: string | null
        }
        Relationships: []
      }
      claims: {
        Row: {
          created_at: string
          id: string
          item_id: string
          picked_up_at: string | null
          pickup_by: string
          receiver_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          picked_up_at?: string | null
          pickup_by?: string
          receiver_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          picked_up_at?: string | null
          pickup_by?: string
          receiver_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          circle_id: string | null
          created_at: string
          id: string
          is_test: boolean
          item_id: string | null
          name: string
          user_id: string
        }
        Insert: {
          circle_id?: string | null
          created_at?: string
          id?: string
          is_test?: boolean
          item_id?: string | null
          name: string
          user_id: string
        }
        Update: {
          circle_id?: string | null
          created_at?: string
          id?: string
          is_test?: boolean
          item_id?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      item_matches: {
        Row: {
          created_at: string
          item_id: string
          notified_at: string | null
          user_id: string | null
          wish_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          notified_at?: string | null
          user_id?: string | null
          wish_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          notified_at?: string | null
          user_id?: string | null
          wish_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_matches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_matches_wish_id_fkey"
            columns: ["wish_id"]
            isOneToOne: false
            referencedRelation: "wishes"
            referencedColumns: ["id"]
          },
        ]
      }
      item_watchers: {
        Row: {
          item_id: string
          user_id: string
        }
        Insert: {
          item_id: string
          user_id: string
        }
        Update: {
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_watchers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_watchers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string
          circle_id: string
          condition: string
          created_at: string
          description: string
          expires_at: string
          giver_id: string
          id: string
          photo_path: string
          pickup_area: string
          reminded: boolean
          status: string
          title: string
        }
        Insert: {
          category: string
          circle_id: string
          condition: string
          created_at?: string
          description?: string
          expires_at?: string
          giver_id: string
          id?: string
          photo_path: string
          pickup_area: string
          reminded?: boolean
          status?: string
          title: string
        }
        Update: {
          category?: string
          circle_id?: string
          condition?: string
          created_at?: string
          description?: string
          expires_at?: string
          giver_id?: string
          id?: string
          photo_path?: string
          pickup_area?: string
          reminded?: boolean
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_revision: {
        Row: {
          applied: number
          id: boolean
          revision: number
        }
        Insert: {
          applied?: number
          id?: boolean
          revision?: number
        }
        Update: {
          applied?: number
          id?: boolean
          revision?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          sender_id: string
          text: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          sender_id: string
          text: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          kind: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          kind: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          kind?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clearout_choice: boolean | null
          created_at: string
          display_name: string
          id: string
          match_notifications: boolean
          onboarded: boolean
        }
        Insert: {
          avatar_url?: string | null
          clearout_choice?: boolean | null
          created_at?: string
          display_name?: string
          id: string
          match_notifications?: boolean
          onboarded?: boolean
        }
        Update: {
          avatar_url?: string | null
          clearout_choice?: boolean | null
          created_at?: string
          display_name?: string
          id?: string
          match_notifications?: boolean
          onboarded?: boolean
        }
        Relationships: []
      }
      swipe_passes: {
        Row: {
          item_id: string
          user_id: string
        }
        Insert: {
          item_id: string
          user_id: string
        }
        Update: {
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_passes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_passes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      synonyms: {
        Row: {
          category: string
          id: string
          words: string[]
        }
        Insert: {
          category: string
          id?: string
          words: string[]
        }
        Update: {
          category?: string
          id?: string
          words?: string[]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      wishes: {
        Row: {
          category: string
          circle_id: string
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          category: string
          circle_id: string
          created_at?: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          category?: string
          circle_id?: string
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishes_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_circle_action: {
        Args: { action: string; payload: Json }
        Returns: Json
      }
      admin_members: {
        Args: never
        Returns: {
          circle_id: string
          display_name: string
          user_id: string
        }[]
      }
      admin_metrics: { Args: never; Returns: Json }
      apply_matches: {
        Args: { expected: number; pairs: Json }
        Returns: boolean
      }
      clean_text: { Args: { t: string }; Returns: string }
      invite_preview: {
        Args: { token: string }
        Returns: {
          name: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_member: { Args: { c: string }; Returns: boolean }
      item_preview: {
        Args: { item: string }
        Returns: {
          circle_name: string
          condition: string
          id: string
          photo_path: string
          title: string
        }[]
      }
      join_from_item: { Args: { item: string }; Returns: string }
      member_names: {
        Args: { circle: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      normal_words: { Args: { t: string }; Returns: string[] }
      passalong_action: {
        Args: { action: string; payload?: Json }
        Returns: Json
      }
      process_due: { Args: never; Returns: undefined }
      wish_matches: {
        Args: { cat: string; p: string; t: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
