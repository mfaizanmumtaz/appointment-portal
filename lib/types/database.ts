export type AppointmentType = 'business' | 'student' | 'in-person'
export type SessionType = 'free' | 'paid'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type SlotType = 'business' | 'student' | 'both'
export type MeetingType = 'online' | 'in-person'
export type MessageStatus = 'unread' | 'read' | 'replied'

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      time_slots: {
        Row: TimeSlot
        Insert: Omit<TimeSlot, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<TimeSlot, 'id' | 'created_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>
      }
      gallery_images: {
        Row: GalleryImage
        Insert: Omit<GalleryImage, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>
      }
      admin_settings: {
        Row: AdminSetting
        Insert: Omit<AdminSetting, 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Omit<AdminSetting, 'id' | 'updated_at'>>
      }
      instant_messages: {
        Row: InstantMessage
        Insert: Omit<InstantMessage, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<InstantMessage, 'id' | 'created_at'>>
      }
      student_triage_log: {
        Row: StudentTriageLog
        Insert: Omit<StudentTriageLog, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<StudentTriageLog, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_slot_atomically: {
        Args: {
          p_slot_id: string
        }
        Returns: boolean
      }
      release_slot_booking: {
        Args: {
          p_slot_id: string
        }
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

export interface Appointment {
  id: string
  type: AppointmentType
  session_type: SessionType
  name: string
  email: string
  phone: string
  company?: string | null
  date: string
  time: string
  status: AppointmentStatus
  slot_id?: string | null
  meeting_type?: MeetingType | null
  meeting_url?: string | null
  venue_address?: string | null
  meeting_notes?: string | null
  purpose?: string | null
  created_at: string
}

export interface TimeSlot {
  id: string
  date: string
  time: string
  is_available: boolean
  slot_type: SlotType
  session_type: SessionType
  created_at: string
}

export interface GalleryImage {
  id: string
  url: string
  title?: string | null
  description?: string | null
  order: number
  created_at: string
}

export interface AdminSetting {
  id: string
  key: string
  value: Record<string, any>
  updated_at: string
}

export interface InstantMessage {
  id: string
  name: string
  email: string
  phone?: string | null
  message: string
  status: MessageStatus
  admin_reply?: string | null
  replied_at?: string | null
  created_at: string
}

export interface StudentTriageLog {
  id: string
  student_name: string
  student_email: string
  student_phone?: string | null
  purpose: string
  ai_decision: 'approved' | 'declined' | 'uncertain'
  ai_reasoning: string
  ai_confidence: number
  manual_review: boolean
  manual_decision?: 'approved' | 'declined' | null
  manual_notes?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
}

