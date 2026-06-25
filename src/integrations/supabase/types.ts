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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_notes: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          date: string
          id: string
          text: string | null
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          date: string
          id?: string
          text?: string | null
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          date?: string
          id?: string
          text?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          goal: number | null
          id: string
          image: string | null
          launch_date: string | null
          name: string
          products: number | null
          season: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal?: number | null
          id?: string
          image?: string | null
          launch_date?: string | null
          name: string
          products?: number | null
          season?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal?: number | null
          id?: string
          image?: string | null
          launch_date?: string | null
          name?: string
          products?: number | null
          season?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fabrics: {
        Row: {
          color: string | null
          created_at: string
          gramatura: number | null
          id: string
          location: string | null
          min_stock: number | null
          name: string
          price_per_meter: number | null
          stock: number | null
          supplier_id: string | null
          type: string | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          gramatura?: number | null
          id?: string
          location?: string | null
          min_stock?: number | null
          name: string
          price_per_meter?: number | null
          stock?: number | null
          supplier_id?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          gramatura?: number | null
          id?: string
          location?: string | null
          min_stock?: number | null
          name?: string
          price_per_meter?: number | null
          stock?: number | null
          supplier_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      op_dispatch_items: {
        Row: {
          color: string | null
          completed_qty: number | null
          created_at: string
          dispatch_id: string
          id: string
          is_completed: boolean | null
          product_name: string
          qty: number | null
          size: string | null
          variation_id: string | null
        }
        Insert: {
          color?: string | null
          completed_qty?: number | null
          created_at?: string
          dispatch_id: string
          id?: string
          is_completed?: boolean | null
          product_name: string
          qty?: number | null
          size?: string | null
          variation_id?: string | null
        }
        Update: {
          color?: string | null
          completed_qty?: number | null
          created_at?: string
          dispatch_id?: string
          id?: string
          is_completed?: boolean | null
          product_name?: string
          qty?: number | null
          size?: string | null
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "op_dispatch_items_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "op_dispatches"
            referencedColumns: ["id"]
          },
        ]
      }
      op_dispatches: {
        Row: {
          access_token: string
          completed_pieces: number | null
          created_at: string
          id: string
          op_number: string
          production_order_id: string | null
          sent_at: string
          status: string | null
          total_pieces: number | null
          updated_at: string
          user_id: string
          workshop_id: string | null
          workshop_name: string | null
          workshop_phone: string | null
        }
        Insert: {
          access_token?: string
          completed_pieces?: number | null
          created_at?: string
          id?: string
          op_number: string
          production_order_id?: string | null
          sent_at?: string
          status?: string | null
          total_pieces?: number | null
          updated_at?: string
          user_id: string
          workshop_id?: string | null
          workshop_name?: string | null
          workshop_phone?: string | null
        }
        Update: {
          access_token?: string
          completed_pieces?: number | null
          created_at?: string
          id?: string
          op_number?: string
          production_order_id?: string | null
          sent_at?: string
          status?: string | null
          total_pieces?: number | null
          updated_at?: string
          user_id?: string
          workshop_id?: string | null
          workshop_name?: string | null
          workshop_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "op_dispatches_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_fabrics: {
        Row: {
          cost: number | null
          created_at: string
          fabric_id: string | null
          fabric_name: string | null
          id: string
          meters_used: number | null
          product_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          fabric_id?: string | null
          fabric_name?: string | null
          id?: string
          meters_used?: number | null
          product_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          fabric_id?: string | null
          fabric_name?: string | null
          id?: string
          meters_used?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_fabrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_trims: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          product_id: string
          quantity: number | null
          trim_id: string | null
          trim_name: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number | null
          trim_id?: string | null
          trim_name?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number | null
          trim_id?: string | null
          trim_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_trims_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          production_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          production_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          production_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_order_items_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_order_trims: {
        Row: {
          created_at: string
          id: string
          production_order_id: string
          qty_per_piece: number | null
          total_qty: number | null
          trim_id: string | null
          trim_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          production_order_id: string
          qty_per_piece?: number | null
          total_qty?: number | null
          trim_id?: string | null
          trim_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          production_order_id?: string
          qty_per_piece?: number | null
          total_qty?: number | null
          trim_id?: string | null
          trim_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_order_trims_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_order_variations: {
        Row: {
          color: string | null
          created_at: string
          id: string
          item_id: string
          meters_per_piece: number | null
          qty: number | null
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          item_id: string
          meters_per_piece?: number | null
          qty?: number | null
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          item_id?: string
          meters_per_piece?: number | null
          qty?: number | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_order_variations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "production_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          created_at: string
          deadline: string | null
          fabric_id: string | null
          fabric_meters_consumed: number | null
          fabric_name: string | null
          id: string
          number: string
          observations: string | null
          priority: string | null
          quantity: number | null
          start_date: string | null
          status: string | null
          total_cost: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
          workshop_id: string | null
          workshop_name: string | null
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          fabric_id?: string | null
          fabric_meters_consumed?: number | null
          fabric_name?: string | null
          id?: string
          number: string
          observations?: string | null
          priority?: string | null
          quantity?: number | null
          start_date?: string | null
          status?: string | null
          total_cost?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
          workshop_id?: string | null
          workshop_name?: string | null
        }
        Update: {
          created_at?: string
          deadline?: string | null
          fabric_id?: string | null
          fabric_meters_consumed?: number | null
          fabric_name?: string | null
          id?: string
          number?: string
          observations?: string | null
          priority?: string | null
          quantity?: number | null
          start_date?: string | null
          status?: string | null
          total_cost?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
          workshop_id?: string | null
          workshop_name?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          collection_id: string | null
          colors: string[] | null
          cost_price: number | null
          created_at: string
          description: string | null
          fabric_ids: string[] | null
          id: string
          image: string | null
          internal_code: string | null
          labor_cost: number | null
          margin: number | null
          meters_per_unit: number | null
          name: string
          operational_cost: number | null
          sale_price: number | null
          sizes: string[] | null
          sku: string | null
          status: string | null
          stock: number | null
          trim_ids: string[] | null
          updated_at: string
          user_id: string
          workshop_id: string | null
        }
        Insert: {
          category?: string | null
          collection_id?: string | null
          colors?: string[] | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          fabric_ids?: string[] | null
          id?: string
          image?: string | null
          internal_code?: string | null
          labor_cost?: number | null
          margin?: number | null
          meters_per_unit?: number | null
          name: string
          operational_cost?: number | null
          sale_price?: number | null
          sizes?: string[] | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          trim_ids?: string[] | null
          updated_at?: string
          user_id: string
          workshop_id?: string | null
        }
        Update: {
          category?: string | null
          collection_id?: string | null
          colors?: string[] | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          fabric_ids?: string[] | null
          id?: string
          image?: string | null
          internal_code?: string | null
          labor_cost?: number | null
          margin?: number | null
          meters_per_unit?: number | null
          name?: string
          operational_cost?: number | null
          sale_price?: number | null
          sizes?: string[] | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          trim_ids?: string[] | null
          updated_at?: string
          user_id?: string
          workshop_id?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          item: string | null
          item_id: string | null
          item_name: string | null
          qty: number
          reason: string | null
          type: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          date?: string
          id?: string
          item?: string | null
          item_id?: string | null
          item_name?: string | null
          qty?: number
          reason?: string | null
          type: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          item?: string | null
          item_id?: string | null
          item_name?: string | null
          qty?: number
          reason?: string | null
          type?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          city: string | null
          contact: string | null
          created_at: string
          email: string | null
          id: string
          lead_time: number | null
          name: string
          phone: string | null
          rating: number | null
          status: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trims: {
        Row: {
          created_at: string
          id: string
          min_stock: number | null
          name: string
          price_per_unit: number | null
          stock: number | null
          supplier_id: string | null
          type: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_stock?: number | null
          name: string
          price_per_unit?: number | null
          stock?: number | null
          supplier_id?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          min_stock?: number | null
          name?: string
          price_per_unit?: number | null
          stock?: number | null
          supplier_id?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workshops: {
        Row: {
          created_at: string
          email: string | null
          id: string
          in_progress: number | null
          name: string
          phone: string | null
          price_per_piece: number | null
          rating: number | null
          specialty: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          in_progress?: number | null
          name: string
          phone?: string | null
          price_per_piece?: number | null
          rating?: number | null
          specialty?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          in_progress?: number | null
          name?: string
          phone?: string | null
          price_per_piece?: number | null
          rating?: number | null
          specialty?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      public_finish_dispatch: { Args: { _token: string }; Returns: undefined }
      public_get_dispatch: { Args: { _token: string }; Returns: Json }
      public_toggle_dispatch_item: {
        Args: { _completed: boolean; _item_id: string; _token: string }
        Returns: undefined
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
    Enums: {},
  },
} as const
