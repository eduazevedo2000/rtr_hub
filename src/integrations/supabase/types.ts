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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      faq: {
        Row: {
          answer: string
          created_at: string
          id: string
          order_index: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          order_index?: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          order_index?: number
          question?: string
        }
        Relationships: []
      }
      qualifying_results: {
        Row: {
          created_at: string
          driver: string
          id: string
          lap_time: string | null
          position: string
          race_id: string
          category: string | null
        }
        Insert: {
          created_at?: string
          driver: string
          id?: string
          lap_time?: string | null
          position: number
          race_id: string
          category?: string | null
        }
        Update: {
          created_at?: string
          driver?: string
          id?: string
          lap_time?: string | null
          position?: number
          race_id?: string
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualifying_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      race_events: {
        Row: {
          category: string | null
          clip_url: string | null
          created_at: string
          description: string
          driver: string | null
          event_type: Database["public"]["Enums"]["race_event_type"]
          id: string
          lap: number
          position: string | null
          race_id: string
        }
        Insert: {
          category?: string | null
          clip_url?: string | null
          created_at?: string
          description: string
          driver?: string | null
          event_type?: Database["public"]["Enums"]["race_event_type"]
          id?: string
          lap: number
          position?: string | null
          race_id: string
        }
        Update: {
          category?: string | null
          clip_url?: string | null
          created_at?: string
          description?: string
          driver?: string | null
          event_type?: Database["public"]["Enums"]["race_event_type"]
          id?: string
          lap?: number
          position?: string | null
          race_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_events_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          created_at: string
          date: string
          id: string
          is_active: boolean
          name: string
          track: string
          position_finished: string | null
          category: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          is_active?: boolean
          name: string
          track: string
          position_finished?: string | null
          category?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_active?: boolean
          name?: string
          track?: string
          position_finished?: string | null
          category?: string | null
        }
        Relationships: []
      }
      team_achievements: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
          race_id: string | null
          position_finished: string | null
          category: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          race_id?: string | null
          position_finished?: string | null
          category?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          race_id?: string | null
          position_finished?: string | null
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_achievements_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          id: string
          storage_path: string
          url: string
          filename: string
          mime_type: string | null
          size_bytes: number | null
          description: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          storage_path: string
          url: string
          filename: string
          mime_type?: string | null
          size_bytes?: number | null
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          storage_path?: string
          url?: string
          filename?: string
          mime_type?: string | null
          size_bytes?: number | null
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      track_info: {
        Row: {
          created_at: string
          id: string
          race_id: string
          track_map_id: string | null
          weather_description: string | null
          weather_image_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          race_id: string
          track_map_id?: string | null
          weather_description?: string | null
          weather_image_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          race_id?: string
          track_map_id?: string | null
          weather_description?: string | null
          weather_image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_info_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_info_weather_image_id_fkey"
            columns: ["weather_image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_info_track_map_id_fkey"
            columns: ["track_map_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          id: string
          created_at: string
          name: string
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          category: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          category?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      race_event_type:
        | "race_start"
        | "pit_stop"
        | "position_change"
        | "fcy_short"
        | "fcy_long"
        | "incident"
        | "driver_change"
        | "restart"
        | "finish"
        | "other"
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
      race_event_type: [
        "race_start",
        "pit_stop",
        "position_change",
        "fcy_short",
        "fcy_long",
        "incident",
        "driver_change",
        "restart",
        "finish",
        "other",
      ],
    },
  },
} as const
