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
      categories: {
        Row: {
          id: string
          key: string
          name: string
          position: number
        }
        Insert: {
          id?: string
          key: string
          name: string
          position?: number
        }
        Update: {
          id?: string
          key?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
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
          role: string
          status: string
          user_id: string
        }
        Insert: {
          circle_id: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          joined_at?: string
          role?: string
          status?: string
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
          description: string
          email_domain: string | null
          general_area: string
          id: string
          invite_token: string
          is_test: boolean
          join_rule: string
          members_can_invite: boolean
          name: string
          owner_id: string | null
          photo_url: string
          required_email_domain: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string
          email_domain?: string | null
          general_area?: string
          id?: string
          invite_token?: string
          is_test?: boolean
          join_rule?: string
          members_can_invite?: boolean
          name: string
          owner_id?: string | null
          photo_url?: string
          required_email_domain?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          description?: string
          email_domain?: string | null
          general_area?: string
          id?: string
          invite_token?: string
          is_test?: boolean
          join_rule?: string
          members_can_invite?: boolean
          name?: string
          owner_id?: string | null
          photo_url?: string
          required_email_domain?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "circles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          created_at: string
          id: string
          item_id: string
          picked_up_at: string | null
          pickup_at: string | null
          pickup_by: string
          receiver_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          picked_up_at?: string | null
          pickup_at?: string | null
          pickup_by?: string
          receiver_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          picked_up_at?: string | null
          pickup_at?: string | null
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
      custom_categories: {
        Row: {
          id: string
          label: string
          normalized: string
        }
        Insert: {
          id?: string
          label: string
          normalized: string
        }
        Update: {
          id?: string
          label?: string
          normalized?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category_id: string | null
          circle_id: string | null
          created_at: string
          id: string
          is_test: boolean
          item_id: string | null
          name: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          circle_id?: string | null
          created_at?: string
          id?: string
          is_test?: boolean
          item_id?: string | null
          name: string
          user_id: string
        }
        Update: {
          category_id?: string | null
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
      item_circles: {
        Row: {
          circle_id: string
          item_id: string
          position: number
        }
        Insert: {
          circle_id: string
          item_id: string
          position?: number
        }
        Update: {
          circle_id?: string
          item_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_circles_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_circles_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
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
          category_id: string | null
          circle_id: string
          condition: string
          created_at: string
          custom_category: string
          custom_category_id: string | null
          description: string
          expires_at: string
          giver_id: string
          id: string
          photo_path: string
          pickup_area: string
          pickup_style: string
          reminded: boolean
          status: string
          title: string
        }
        Insert: {
          category: string
          category_id?: string | null
          circle_id: string
          condition: string
          created_at?: string
          custom_category?: string
          custom_category_id?: string | null
          description?: string
          expires_at?: string
          giver_id: string
          id?: string
          photo_path: string
          pickup_area: string
          pickup_style?: string
          reminded?: boolean
          status?: string
          title: string
        }
        Update: {
          category?: string
          category_id?: string | null
          circle_id?: string
          condition?: string
          created_at?: string
          custom_category?: string
          custom_category_id?: string | null
          description?: string
          expires_at?: string
          giver_id?: string
          id?: string
          photo_path?: string
          pickup_area?: string
          pickup_style?: string
          reminded?: boolean
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
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
      kind_words: {
        Row: {
          claim_id: string
          created_at: string
          giver_id: string
          id: string
          photo_path: string
          show_on_profile: boolean
          text: string
          writer_id: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          giver_id: string
          id?: string
          photo_path?: string
          show_on_profile?: boolean
          text: string
          writer_id: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          giver_id?: string
          id?: string
          photo_path?: string
          show_on_profile?: boolean
          text?: string
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kind_words_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: true
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kind_words_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kind_words_writer_id_fkey"
            columns: ["writer_id"]
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
          kind: string
          seen_at: string | null
          selected_at: string | null
          sender_id: string
          slots: string[]
          text: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          kind?: string
          seen_at?: string | null
          selected_at?: string | null
          sender_id: string
          slots?: string[]
          text: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          kind?: string
          seen_at?: string | null
          selected_at?: string | null
          sender_id?: string
          slots?: string[]
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
          actor_id: string | null
          claim_id: string | null
          created_at: string
          id: string
          item_id: string | null
          kind: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          claim_id?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          claim_id?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
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
          bio: string
          claim_emails: boolean
          clearout_choice: boolean | null
          created_at: string
          display_name: string
          general_area: string
          id: string
          match_notifications: boolean
          message_emails: boolean
          onboarded: boolean
          pickup_times: string[]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          claim_emails?: boolean
          clearout_choice?: boolean | null
          created_at?: string
          display_name?: string
          general_area?: string
          id: string
          match_notifications?: boolean
          message_emails?: boolean
          onboarded?: boolean
          pickup_times?: string[]
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          claim_emails?: boolean
          clearout_choice?: boolean | null
          created_at?: string
          display_name?: string
          general_area?: string
          id?: string
          match_notifications?: boolean
          message_emails?: boolean
          onboarded?: boolean
          pickup_times?: string[]
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
          category_id: string | null
          id: string
          words: string[]
        }
        Insert: {
          category: string
          category_id?: string | null
          id?: string
          words: string[]
        }
        Update: {
          category?: string
          category_id?: string | null
          id?: string
          words?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "synonyms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
          category_id: string | null
          circle_id: string
          created_at: string
          custom_category: string
          custom_category_id: string | null
          id: string
          text: string
          user_id: string
        }
        Insert: {
          category: string
          category_id?: string | null
          circle_id: string
          created_at?: string
          custom_category?: string
          custom_category_id?: string | null
          id?: string
          text: string
          user_id: string
        }
        Update: {
          category?: string
          category_id?: string | null
          circle_id?: string
          created_at?: string
          custom_category?: string
          custom_category_id?: string | null
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
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
      category_action: {
        Args: { action: string; payload: Json }
        Returns: Json
      }
      category_admin_data: { Args: never; Returns: Json }
      chat_participant: { Args: { claim: string }; Returns: boolean }
      chat_preferences: { Args: { claim: string }; Returns: string[] }
      circle_action: { Args: { action: string; payload?: Json }; Returns: Json }
      circle_members_detail: {
        Args: { circle: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          general_area: string
          id: string
          joined_at: string
          role: string
          status: string
        }[]
      }
      clean_text: { Args: { t: string }; Returns: string }
      custom_category_key: { Args: { t: string }; Returns: string }
      find_circles: { Args: never; Returns: Json }
      has_item_access: { Args: { item: string }; Returns: boolean }
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
      member_display_name: { Args: { t: string }; Returns: string }
      member_names: {
        Args: { circle: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      member_profile: {
        Args: { circle: string; member: string }
        Returns: Json
      }
      my_circles: { Args: never; Returns: Json }
      normal_words: { Args: { t: string }; Returns: string[] }
      passalong_action: {
        Args: { action: string; payload?: Json }
        Returns: Json
      }
      passalong_category_action: {
        Args: { action: string; payload?: Json }
        Returns: Json
      }
      passalong_circle_action: {
        Args: { action: string; payload?: Json }
        Returns: Json
      }
      passalong_legacy_action: {
        Args: { action: string; payload?: Json }
        Returns: Json
      }
      process_due: { Args: never; Returns: undefined }
      safe_general_area: { Args: { t: string }; Returns: boolean }
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
