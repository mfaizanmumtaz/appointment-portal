export type AppointmentType = 'business' | 'student' | 'in-person'
export type SessionType = 'free' | 'paid'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type SlotType = 'business' | 'student' | 'both'
export type MeetingType = 'online' | 'in-person'
export type MessageStatus = 'unread' | 'read' | 'replied'
export type EventInvitationStatus = 'pending' | 'confirmed' | 'rejected'
export type AudienceSize = '<50' | '50-100' | '100-250' | '250-500' | '500+'
export type TravelExpenses = 'Yes' | 'No' | 'Partial'

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
      locations: {
        Row: Location
        Insert: Omit<Location, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Location, 'id' | 'created_at'>>
      }
      event_invitations: {
        Row: EventInvitation
        Insert: Omit<EventInvitation, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<EventInvitation, 'id' | 'created_at'>>
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
  meeting_mode: MeetingType
  duration: number
  location_id?: string | null  // For in-person meetings
  booking_status: 'available' | 'booking' | 'booked'
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

export interface Location {
  id: string
  name: string
  created_at: string
}

export interface EventInvitation {
  id: string
  event_title: string
  organiser_name: string
  organiser_email: string
  event_date: string
  event_time: string
  venue: string
  audience_size: AudienceSize
  travel_expenses: TravelExpenses
  event_details: string
  attachment_url?: string | null
  attachment_name?: string | null
  status: EventInvitationStatus
  rejection_reason?: string | null
  admin_notes?: string | null
  confirmed_at?: string | null
  rejected_at?: string | null
  created_at: string
}

