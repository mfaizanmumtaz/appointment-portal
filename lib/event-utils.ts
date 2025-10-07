"use client"

import { supabase } from "@/lib/supabase"
import type { EventInvitation, EventInvitationStatus, AudienceSize, TravelExpenses } from "@/lib/types/database"

export interface CreateEventInvitationData {
  eventTitle: string
  organiserName: string
  organiserEmail: string
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

    const { data: invitation, error } = await (supabase as any)
      .from('event_invitations')
      .insert([
        {
          event_title: data.eventTitle,
          organiser_name: data.organiserName,
          organiser_email: data.organiserEmail,
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

    // Send notification emails
    try {
      console.log('📧 Sending notification emails...')
      
      // Send admin notification email (don't block on failure)
      sendEventAdminNotification(invitation).catch(error => {
        console.error('⚠️ Failed to send admin notification email:', error)
      })

      // Send organizer confirmation email (don't block on failure)
      sendEventOrganizerConfirmation(invitation).catch(error => {
        console.error('⚠️ Failed to send organizer confirmation email:', error)
      })

      console.log('✅ Notification emails queued successfully')
    } catch (emailError) {
      console.error('⚠️ Email sending failed, but invitation created successfully:', emailError)
    }

    return { success: true, data: invitation }

  } catch (error) {
    console.error('❌ Failed to create event invitation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Fetch all event invitations for admin
export const fetchEventInvitations = async () => {
  try {
    console.log('📥 Fetching event invitations...')

    const { data: invitations, error } = await (supabase as any)
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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] }
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

    const { data: invitation, error } = await (supabase as any)
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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
    const { count, error } = await (supabase as any)
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

// Send event confirmation email
export const sendEventConfirmationEmail = async (invitation: EventInvitation) => {
  try {
    console.log('📧 Sending event confirmation email...', invitation.organiser_name)

    const { data, error } = await supabase.functions.invoke('send-event-email', {
      body: {
        to: invitation.organiser_email,
        organiserName: invitation.organiser_name,
        eventTitle: invitation.event_title,
        eventDate: invitation.event_date,
        eventTime: invitation.event_time,
        venue: invitation.venue,
        eventDetails: invitation.event_details,
        type: 'confirmation'
      }
    })

    if (error) {
      console.error('Error sending confirmation email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event confirmation email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send event confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send event rejection email
export const sendEventRejectionEmail = async (invitation: EventInvitation, rejectionReason: string) => {
  try {
    console.log('📧 Sending event rejection email...', invitation.organiser_name)

    const { data, error } = await supabase.functions.invoke('send-event-email', {
      body: {
        to: invitation.organiser_email,
        organiserName: invitation.organiser_name,
        eventTitle: invitation.event_title,
        eventDate: invitation.event_date,
        eventTime: invitation.event_time,
        venue: invitation.venue,
        eventDetails: invitation.event_details,
        type: 'rejection',
        rejectionReason: rejectionReason
      }
    })

    if (error) {
      console.error('Error sending rejection email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event rejection email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send event rejection email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send event cancellation email
export const sendEventCancellationEmail = async (invitation: EventInvitation, cancellationReason: string) => {
  try {
    console.log('📧 Sending event cancellation email...', invitation.organiser_name)

    const { data, error } = await supabase.functions.invoke('send-event-email', {
      body: {
        to: invitation.organiser_email,
        organiserName: invitation.organiser_name,
        eventTitle: invitation.event_title,
        eventDate: invitation.event_date,
        eventTime: invitation.event_time,
        venue: invitation.venue,
        eventDetails: invitation.event_details,
        type: 'cancellation',
        cancellationReason: cancellationReason
      }
    })

    if (error) {
      console.error('Error sending cancellation email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Event cancellation email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send event cancellation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send admin notification email for new event invitation
export const sendEventAdminNotification = async (invitation: EventInvitation) => {
  try {
    console.log('📧 Sending admin notification for new event invitation...', invitation.event_title)

    const { data, error } = await supabase.functions.invoke('send-event-email', {
      body: {
        to: 'irfan@xevensolutions.com', // Admin email
        organiserName: invitation.organiser_name,
        organiserEmail: invitation.organiser_email,
        eventTitle: invitation.event_title,
        eventDate: invitation.event_date,
        eventTime: invitation.event_time,
        venue: invitation.venue,
        eventDetails: invitation.event_details,
        audienceSize: invitation.audience_size,
        travelExpenses: invitation.travel_expenses,
        type: 'admin_notification'
      }
    })

    if (error) {
      console.error('Error sending admin notification email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Admin notification email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send organizer confirmation email
export const sendEventOrganizerConfirmation = async (invitation: EventInvitation) => {
  try {
    console.log('📧 Sending organizer confirmation email...', invitation.organiser_name)

    const { data, error } = await supabase.functions.invoke('send-event-email', {
      body: {
        to: invitation.organiser_email,
        organiserName: invitation.organiser_name,
        eventTitle: invitation.event_title,
        eventDate: invitation.event_date,
        eventTime: invitation.event_time,
        venue: invitation.venue,
        eventDetails: invitation.event_details,
        type: 'organizer_confirmation'
      }
    })

    if (error) {
      console.error('Error sending organizer confirmation email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Organizer confirmation email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send organizer confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
