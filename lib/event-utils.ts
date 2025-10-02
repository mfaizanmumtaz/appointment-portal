"use client"

import { supabase } from "@/lib/supabase"
import type { EventInvitation, EventInvitationStatus, AudienceSize, TravelExpenses } from "@/lib/types/database"

export interface CreateEventInvitationData {
  eventTitle: string
  organiserName: string
  eventDate: string
  eventTime: string
  venue: string
  audienceSize: AudienceSize
  travelExpenses: TravelExpenses
  eventDetails: string
  attachmentUrl?: string
  attachmentName?: string
}

export interface UpdateEventInvitationData {
  status?: EventInvitationStatus
  rejection_reason?: string
  admin_notes?: string
  confirmed_at?: string
  rejected_at?: string
}

// Create a new event invitation
export const createEventInvitation = async (data: CreateEventInvitationData) => {
  try {
    console.log('📝 Creating event invitation:', data)

    const { data: invitation, error } = await supabase
      .from('event_invitations')
      .insert([
        {
          event_title: data.eventTitle,
          organiser_name: data.organiserName,
          event_date: data.eventDate,
          event_time: data.eventTime,
          venue: data.venue,
          audience_size: data.audienceSize,
          travel_expenses: data.travelExpenses,
          event_details: data.eventDetails,
          attachment_url: data.attachmentUrl,
          attachment_name: data.attachmentName,
          status: 'pending' as EventInvitationStatus
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating event invitation:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event invitation created successfully:', invitation)
    return { success: true, data: invitation }

  } catch (error) {
    console.error('❌ Failed to create event invitation:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all event invitations for admin
export const fetchEventInvitations = async () => {
  try {
    console.log('📥 Fetching event invitations...')

    const { data: invitations, error } = await supabase
      .from('event_invitations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching event invitations:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event invitations fetched successfully:', invitations?.length || 0, 'invitations')
    return { success: true, data: invitations || [] }

  } catch (error) {
    console.error('❌ Failed to fetch event invitations:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Update event invitation status
export const updateEventInvitation = async (invitationId: string, updates: UpdateEventInvitationData) => {
  try {
    console.log('🔄 Updating event invitation:', invitationId, updates)

    const updateData: any = {
      ...updates
    }

    // Set timestamps based on status
    if (updates.status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
      updateData.rejected_at = null
    } else if (updates.status === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
      updateData.confirmed_at = null
    }

    const { data: invitation, error } = await supabase
      .from('event_invitations')
      .update(updateData)
      .eq('id', invitationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event invitation:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event invitation updated successfully:', invitation)
    return { success: true, data: invitation }

  } catch (error) {
    console.error('❌ Failed to update event invitation:', error)
    return { success: false, error: error.message }
  }
}

// Confirm event invitation
export const confirmEventInvitation = async (invitationId: string, adminNotes?: string) => {
  return updateEventInvitation(invitationId, {
    status: 'confirmed',
    admin_notes: adminNotes
  })
}

// Reject event invitation
export const rejectEventInvitation = async (invitationId: string, rejectionReason: string, adminNotes?: string) => {
  return updateEventInvitation(invitationId, {
    status: 'rejected',
    rejection_reason: rejectionReason,
    admin_notes: adminNotes
  })
}

// Get pending invitations count
export const getPendingInvitationsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('event_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (error) {
      console.error('Error getting pending invitations count:', error)
      return { success: false, count: 0 }
    }

    return { success: true, count: count || 0 }

  } catch (error) {
    console.error('❌ Failed to get pending invitations count:', error)
    return { success: false, count: 0 }
  }
}

// Subscribe to real-time event invitation updates
export const subscribeToEventInvitations = (callback: (payload: any) => void) => {
  console.log('🔄 Setting up real-time subscription for event invitations...')
  
  const subscription = supabase
    .channel('event-invitations')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'event_invitations'
    }, callback)
    .subscribe()

  return subscription
}
