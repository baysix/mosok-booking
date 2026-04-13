export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'user' | 'master' | 'admin'
          avatar_url: string | null
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'user' | 'master' | 'admin'
          avatar_url?: string | null
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'user' | 'master' | 'admin'
          avatar_url?: string | null
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      masters: {
        Row: {
          id: string
          user_id: string
          business_name: string
          description: string
          specialties: string[]
          years_experience: number
          region: string

          address: string
          base_price: number
          bank_name: string
          account_number: string
          account_holder: string
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          images: string[]
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          description?: string
          specialties?: string[]
          years_experience?: number
          region?: string

          address?: string
          base_price?: number
          bank_name?: string
          account_number?: string
          account_holder?: string
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          images?: string[]
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          description?: string
          specialties?: string[]
          years_experience?: number
          region?: string

          address?: string
          base_price?: number
          bank_name?: string
          account_number?: string
          account_holder?: string
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          images?: string[]
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'masters_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      master_memberships: {
        Row: {
          id: string
          master_id: string
          user_id: string
          joined_via: string
          join_code_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          user_id: string
          joined_via?: string
          join_code_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'master_memberships_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'master_memberships_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'master_memberships_join_code_id_fkey'
            columns: ['join_code_id']
            isOneToOne: false
            referencedRelation: 'join_codes'
            referencedColumns: ['id']
          }
        ]
      }
      join_codes: {
        Row: {
          id: string
          master_id: string
          code: string
          label: string | null
          max_uses: number | null
          current_uses: number
          status: 'active' | 'expired' | 'used_up'
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          code: string
          label?: string | null
          max_uses?: number | null
          current_uses?: number
          status?: 'active' | 'expired' | 'used_up'
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          label?: string | null
          max_uses?: number | null
          current_uses?: number
          status?: 'active' | 'expired' | 'used_up'
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'join_codes_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          }
        ]
      }
      reservations: {
        Row: {
          id: string
          master_id: string
          user_id: string | null
          date: string
          time_slot: string
          duration: number
          party_size: number
          consultation_type: string
          notes: string
          total_price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
          rejection_reason: string | null
          source: 'online' | 'manual'
          manual_customer_name: string | null
          manual_customer_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          master_id: string
          user_id?: string | null
          date: string
          time_slot: string
          duration?: number
          party_size?: number
          consultation_type: string
          notes?: string
          total_price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
          rejection_reason?: string | null
          source?: 'online' | 'manual'
          manual_customer_name?: string | null
          manual_customer_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
          rejection_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reservations_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      master_weekly_hours: {
        Row: {
          id: string
          master_id: string
          day_of_week: number
          is_working: boolean
          time_slots: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          master_id: string
          day_of_week: number
          is_working?: boolean
          time_slots?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_working?: boolean
          time_slots?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'master_weekly_hours_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          }
        ]
      }
      master_off_days: {
        Row: {
          id: string
          master_id: string
          off_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          off_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          off_date?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'master_off_days_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: string
          user_id: string
          master_id: string
          last_message: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          master_id: string
          last_message?: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          last_message?: string
          last_message_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_rooms_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_rooms_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          type: 'text' | 'image' | 'system'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          type?: 'text' | 'image' | 'system'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'messages_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'chat_rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      prayer_products: {
        Row: {
          id: string
          master_id: string
          category: string
          name: string
          description: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          master_id: string
          category?: string
          name: string
          description?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category?: string
          name?: string
          description?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prayer_products_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          }
        ]
      }
      prayer_product_options: {
        Row: {
          id: string
          product_id: string
          duration_days: number
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          duration_days: number
          price?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          price?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'prayer_product_options_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'prayer_products'
            referencedColumns: ['id']
          }
        ]
      }
      prayer_orders: {
        Row: {
          id: string
          master_id: string
          user_id: string | null
          product_id: string
          option_id: string | null
          category: string
          product_name: string
          duration_days: number
          price: number
          beneficiary_name: string
          wish_text: string
          start_date: string
          end_date: string
          status: string
          source: string
          manual_customer_name: string | null
          manual_customer_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          master_id: string
          user_id?: string | null
          product_id: string
          option_id?: string | null
          category?: string
          product_name: string
          duration_days: number
          price?: number
          beneficiary_name?: string
          wish_text?: string
          start_date: string
          end_date: string
          status?: string
          source?: string
          manual_customer_name?: string | null
          manual_customer_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prayer_orders_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prayer_orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prayer_orders_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'prayer_products'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          master_id: string | null
          reservation_id: string | null
          type: 'reservation_requested' | 'reservation_confirmed' | 'reservation_rejected' | 'reservation_cancelled' | 'reservation_completed' | 'membership_approved'
          title: string
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          master_id?: string | null
          reservation_id?: string | null
          type: 'reservation_requested' | 'reservation_confirmed' | 'reservation_rejected' | 'reservation_cancelled' | 'reservation_completed' | 'membership_approved'
          title: string
          body?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_master_id_fkey'
            columns: ['master_id']
            isOneToOne: false
            referencedRelation: 'masters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_reservation_id_fkey'
            columns: ['reservation_id']
            isOneToOne: false
            referencedRelation: 'reservations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'master' | 'admin'
      master_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      reservation_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
      reservation_source: 'online' | 'manual'
      join_code_status: 'active' | 'expired' | 'used_up'
      notification_type: 'reservation_requested' | 'reservation_confirmed' | 'reservation_rejected' | 'reservation_cancelled' | 'reservation_completed' | 'membership_approved'
      message_type: 'text' | 'image' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
