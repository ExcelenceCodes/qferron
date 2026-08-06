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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      account_details: {
        Row: {
          account_id: string
          created_at: string
          detail_kind: string
          id: string
          masked_hint: string | null
          payload_ciphertext: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          detail_kind?: string
          id?: string
          masked_hint?: string | null
          payload_ciphertext: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          detail_kind?: string
          id?: string
          masked_hint?: string | null
          payload_ciphertext?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_details_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_join_requests: {
        Row: {
          account_id: string
          created_at: string
          id: string
          message: string | null
          requester_email: string | null
          requester_id: string
          requester_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          message?: string | null
          requester_email?: string | null
          requester_id: string
          requester_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          message?: string | null
          requester_email?: string | null
          requester_id?: string
          requester_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_join_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_members: {
        Row: {
          account_id: string
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          member_role: string
          share_pct: number | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          member_role?: string
          share_pct?: number | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          member_role?: string
          share_pct?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          archived: boolean
          balance: number
          created_at: string
          currency: string
          id: string
          is_shared: boolean
          name: string
          note: string | null
          share_code: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_shared?: boolean
          name: string
          note?: string | null
          share_code: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_shared?: boolean
          name?: string
          note?: string | null
          share_code?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string
          enabled: boolean
          endpoint: string
          feature_key: string
          id: string
          injections: string[]
          label: string
          markup: string
          model: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          endpoint?: string
          feature_key: string
          id?: string
          injections?: string[]
          label: string
          markup?: string
          model?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          endpoint?: string
          feature_key?: string
          id?: string
          injections?: string[]
          label?: string
          markup?: string
          model?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          acquired_at: string | null
          created_at: string
          currency: string
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          name: string
          note: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          name: string
          note?: string | null
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          acquired_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          name?: string
          note?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          read_minutes: number
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          persona: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          note: string | null
          paid_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          counterparty: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          interest_rate: number
          kind: Database["public"]["Enums"]["debt_kind"]
          note: string | null
          outstanding: number
          principal: number
          status: Database["public"]["Enums"]["debt_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          counterparty: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          interest_rate?: number
          kind?: Database["public"]["Enums"]["debt_kind"]
          note?: string | null
          outstanding?: number
          principal?: number
          status?: Database["public"]["Enums"]["debt_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          counterparty?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          interest_rate?: number
          kind?: Database["public"]["Enums"]["debt_kind"]
          note?: string | null
          outstanding?: number
          principal?: number
          status?: Database["public"]["Enums"]["debt_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          from_email: string
          id: string
          message: string
          status: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          from_email: string
          id?: string
          message: string
          status?: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          from_email?: string
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investment_contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          investment_id: string
          kind: string
          note: string | null
          occurred_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investment_id: string
          kind?: string
          note?: string | null
          occurred_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string
          kind?: string
          note?: string | null
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_contributions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          created_at: string
          currency: string
          current_value: number
          growth_rate: number
          id: string
          kind: Database["public"]["Enums"]["investment_kind"]
          maturity_date: string | null
          name: string
          note: string | null
          principal: number
          provider: string | null
          risk: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_value?: number
          growth_rate?: number
          id?: string
          kind?: Database["public"]["Enums"]["investment_kind"]
          maturity_date?: string | null
          name: string
          note?: string | null
          principal?: number
          provider?: string | null
          risk?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_value?: number
          growth_rate?: number
          id?: string
          kind?: Database["public"]["Enums"]["investment_kind"]
          maturity_date?: string | null
          name?: string
          note?: string | null
          principal?: number
          provider?: string | null
          risk?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          href: string | null
          icon: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          href?: string | null
          icon?: string | null
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          href?: string | null
          icon?: string | null
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          base_currency: string
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          plan: Database["public"]["Enums"]["account_plan"]
          referral_code: string | null
          referred_by: string | null
          status: Database["public"]["Enums"]["account_status"]
          theme: string
          updated_at: string
          wallpaper: string
        }
        Insert: {
          avatar_url?: string | null
          base_currency?: string
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["account_plan"]
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          theme?: string
          updated_at?: string
          wallpaper?: string
        }
        Update: {
          avatar_url?: string | null
          base_currency?: string
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["account_plan"]
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          theme?: string
          updated_at?: string
          wallpaper?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          referred_id: string | null
          referrer_id: string
          reward_cents: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          referred_id?: string | null
          referrer_id: string
          reward_cents?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          referred_id?: string | null
          referrer_id?: string
          reward_cents?: number
          status?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          action_expr: string
          action_type: string
          action_value: string
          condition_field: string
          condition_value: string
          created_at: string
          enabled: boolean
          hits: number
          id: string
          last_run_at: string | null
          match_expr: string
          name: string
          operator: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_expr?: string
          action_type?: string
          action_value?: string
          condition_field?: string
          condition_value?: string
          created_at?: string
          enabled?: boolean
          hits?: number
          id?: string
          last_run_at?: string | null
          match_expr?: string
          name: string
          operator?: string
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_expr?: string
          action_type?: string
          action_value?: string
          condition_field?: string
          condition_value?: string
          created_at?: string
          enabled?: boolean
          hits?: number
          id?: string
          last_run_at?: string | null
          match_expr?: string
          name?: string
          operator?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string
          currency: string
          direction: Database["public"]["Enums"]["tx_direction"]
          id: string
          merchant: string | null
          note: string | null
          occurred_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string
          created_at?: string
          currency?: string
          direction: Database["public"]["Enums"]["tx_direction"]
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          direction?: Database["public"]["Enums"]["tx_direction"]
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallpapers: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          image_path: string | null
          key: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          image_path?: string | null
          key: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          image_path?: string | null
          key?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_account: { Args: { _account_id: string }; Returns: boolean }
      can_write_account: { Args: { _account_id: string }; Returns: boolean }
      gen_share_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      lookup_account_by_code: {
        Args: { _code: string }
        Returns: {
          account_id: string
          currency: string
          is_shared: boolean
          member_count: number
          name: string
          owner_name: string
          type: Database["public"]["Enums"]["account_type"]
        }[]
      }
    }
    Enums: {
      account_plan: "free" | "pro" | "team"
      account_status: "active" | "suspended"
      account_type: "cash" | "bank" | "mobile" | "wallet" | "card" | "shared"
      app_role: "admin" | "moderator" | "user"
      asset_kind: "property" | "vehicle" | "equity" | "crypto" | "other"
      debt_kind: "loan" | "credit"
      debt_status: "active" | "settled" | "overdue"
      feedback_status: "new" | "in_review" | "closed"
      investment_kind:
        | "stocks"
        | "bonds"
        | "mutual_fund"
        | "real_estate"
        | "business"
        | "crypto"
        | "savings_plan"
        | "other"
      notification_category: "money" | "shared" | "ai" | "system"
      tx_direction: "in" | "out"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_plan: ["free", "pro", "team"],
      account_status: ["active", "suspended"],
      account_type: ["cash", "bank", "mobile", "wallet", "card", "shared"],
      app_role: ["admin", "moderator", "user"],
      asset_kind: ["property", "vehicle", "equity", "crypto", "other"],
      debt_kind: ["loan", "credit"],
      debt_status: ["active", "settled", "overdue"],
      feedback_status: ["new", "in_review", "closed"],
      investment_kind: [
        "stocks",
        "bonds",
        "mutual_fund",
        "real_estate",
        "business",
        "crypto",
        "savings_plan",
        "other",
      ],
      notification_category: ["money", "shared", "ai", "system"],
      tx_direction: ["in", "out"],
    },
  },
} as const
