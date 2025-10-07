import { supabase } from '@/lib/supabase'
import type { InterviewRequest, InterviewStatus } from '@/lib/types/database'

export interface CreateInterviewRequestData {
  podcasterName: string
  email: string
  phone: string
  linkedinUrl: string
  youtubeLink: string
  facebookLink: string
  agenda: string
  preferredDate?: string
  notes?: string
}

export interface UpdateInterviewRequestData {
  status: InterviewStatus
  adminNotes?: string
  rejectionReason?: string
  responded_at?: string
}

// Create a new interview request
export const createInterviewRequest = async (data: CreateInterviewRequestData) => {
  try {
    console.log('📝 Creating interview request:', data)

    const { data: request, error } = await (supabase as any)
      .from('interview_requests')
      .insert([
        {
          podcaster_name: data.podcasterName,
          email: data.email,
          phone: data.phone,
          linkedin_url: data.linkedinUrl,
          youtube_link: data.youtubeLink,
          facebook_link: data.facebookLink,
          agenda: data.agenda,
          preferred_date: data.preferredDate || null,
          notes: data.notes || null,
          status: 'pending' as InterviewStatus
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating interview request:', error)
      throw new Error(error.message)
    }

    console.log('✅ Interview request created successfully:', request)

    // Send notification emails
    try {
      console.log('📧 Sending notification emails...')
      
      // Send admin notification email (don't block on failure)
      sendInterviewAdminNotification(request).catch(error => {
        console.error('⚠️ Failed to send admin notification email:', error)
      })

      // Send podcaster confirmation email (don't block on failure)
      sendInterviewPodcasterConfirmation(request).catch(error => {
        console.error('⚠️ Failed to send podcaster confirmation email:', error)
      })

      console.log('✅ Notification emails queued successfully')
    } catch (emailError) {
      console.error('⚠️ Email sending failed, but request created successfully:', emailError)
    }

    return { success: true, data: request }

  } catch (error) {
    console.error('❌ Failed to create interview request:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all interview requests for admin
export const fetchInterviewRequests = async () => {
  try {
    console.log('📥 Fetching interview requests...')

    const { data: requests, error } = await (supabase as any)
      .from('interview_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interview requests:', error)
      throw new Error(error.message)
    }

    console.log(`✅ Fetched ${requests?.length || 0} interview requests`)
    return { success: true, data: requests || [] }

  } catch (error) {
    console.error('❌ Failed to fetch interview requests:', error)
    return { success: false, error: error.message }
  }
}

// Update interview request status
export const updateInterviewRequestStatus = async (id: string, updateData: UpdateInterviewRequestData) => {
  try {
    console.log('🔄 Updating interview request:', id, updateData)

    const { data: request, error } = await (supabase as any)
      .from('interview_requests')
      .update({
        status: updateData.status,
        admin_notes: updateData.adminNotes,
        responded_at: updateData.responded_at || new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating interview request:', error)
      throw new Error(error.message)
    }

    console.log('✅ Interview request updated successfully')
    return { success: true, data: request }

  } catch (error) {
    console.error('❌ Failed to update interview request:', error)
    return { success: false, error: error.message }
  }
}

// Send interview approval email
export const sendInterviewApprovalEmail = async (request: InterviewRequest) => {
  try {
    console.log('📧 Sending interview approval email...', request.podcaster_name)

    const { data, error } = await supabase.functions.invoke('send-interview-email', {
      body: {
        to: request.email,
        podcasterName: request.podcaster_name,
        email: request.email,
        phone: request.phone,
        linkedinUrl: request.linkedin_url,
        youtubeLink: request.youtube_link,
        facebookLink: request.facebook_link,
        agenda: request.agenda,
        preferredDate: request.preferred_date,
        notes: request.notes,
        type: 'approval'
      }
    })

    if (error) {
      console.error('Error sending approval email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Interview approval email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send approval email:', error)
    return { success: false, error: error.message }
  }
}

// Send interview rejection email
export const sendInterviewRejectionEmail = async (request: InterviewRequest, rejectionReason: string) => {
  try {
    console.log('📧 Sending interview rejection email...', request.podcaster_name)

    const { data, error } = await supabase.functions.invoke('send-interview-email', {
      body: {
        to: request.email,
        podcasterName: request.podcaster_name,
        email: request.email,
        phone: request.phone,
        linkedinUrl: request.linkedin_url,
        youtubeLink: request.youtube_link,
        facebookLink: request.facebook_link,
        agenda: request.agenda,
        preferredDate: request.preferred_date,
        notes: request.notes,
        rejectionReason,
        type: 'rejection'
      }
    })

    if (error) {
      console.error('Error sending rejection email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Interview rejection email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send rejection email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification email for new interview request
export const sendInterviewAdminNotification = async (request: InterviewRequest) => {
  try {
    console.log('📧 Sending admin notification for new interview request...', request.agenda)

    const { data, error } = await supabase.functions.invoke('send-interview-email', {
      body: {
        to: 'mfaizanmumtaz999@gmail.com', // Admin email
        podcasterName: request.podcaster_name,
        email: request.email,
        phone: request.phone,
        linkedinUrl: request.linkedin_url,
        youtubeLink: request.youtube_link,
        facebookLink: request.facebook_link,
        agenda: request.agenda,
        preferredDate: request.preferred_date,
        notes: request.notes,
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
    return { success: false, error: error.message }
  }
}

// Send podcaster confirmation email
export const sendInterviewPodcasterConfirmation = async (request: InterviewRequest) => {
  try {
    console.log('📧 Sending podcaster confirmation email...', request.podcaster_name)

    const { data, error } = await supabase.functions.invoke('send-interview-email', {
      body: {
        to: request.email,
        podcasterName: request.podcaster_name,
        email: request.email,
        phone: request.phone,
        linkedinUrl: request.linkedin_url,
        youtubeLink: request.youtube_link,
        facebookLink: request.facebook_link,
        agenda: request.agenda,
        preferredDate: request.preferred_date,
        notes: request.notes,
        type: 'podcaster_confirmation'
      }
    })

    if (error) {
      console.error('Error sending podcaster confirmation email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Podcaster confirmation email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send podcaster confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send interview cancellation email
export const sendInterviewCancellationEmail = async (request: InterviewRequest, cancellationReason: string) => {
  try {
    console.log('📧 Sending interview cancellation email...', request.podcaster_name)

    const { data, error } = await supabase.functions.invoke('send-interview-email', {
      body: {
        to: request.email,
        podcasterName: request.podcaster_name,
        email: request.email,
        phone: request.phone,
        linkedinUrl: request.linkedin_url,
        youtubeLink: request.youtube_link,
        facebookLink: request.facebook_link,
        agenda: request.agenda,
        preferredDate: request.preferred_date,
        notes: request.notes,
        cancellationReason,
        type: 'cancellation'
      }
    })

    if (error) {
      console.error('Error sending cancellation email:', error)
      throw new Error(error.message)
    }

    console.log('✅ Interview cancellation email sent successfully')
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send interview cancellation email:', error)
    return { success: false, error: error.message }
  }
}
