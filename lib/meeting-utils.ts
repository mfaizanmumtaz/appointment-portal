// Meeting and email utilities

export const generateZoomLink = () => {
  // Generate a realistic Zoom meeting link
  const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000 // 10 digit ID
  const password = Math.random().toString(36).substring(2, 8).toUpperCase()

  return {
    url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    meetingId: meetingId.toString(),
    password: password
  }
}

export const generateVenueAddress = () => {
  // Default venue address for in-person meetings
  return "Xeven Solutions Office\n123 Business Avenue, Suite 500\nTech District, City 12345\nPakistan"
}

// New Resend-based booking email functions
export const sendBookingEmails = async (emailData: {
  clientEmail?: {
    to: string
    name: string
    date?: string
    time?: string
    meetingType: 'online' | 'in-person'
    meetingUrl?: string
    venueAddress?: string
    sessionType: 'free' | 'paid'
    appointmentType: 'business' | 'student' | 'in-person'
    status: 'confirmed' | 'pending'
  }
  adminEmail?: {
    bookingType: 'business' | 'student' | 'in-person'
    clientName: string
    clientEmail: string
    clientPhone: string
    date?: string
    time?: string
    purpose: string
    sessionType: 'free' | 'paid'
    status: 'confirmed' | 'pending'
  }
}) => {
  try {
    console.log('📧 Sending booking emails via Resend')

    const { supabase } = await import("@/lib/supabase")

    const response = await supabase.functions.invoke('send-booking-email', {
      body: emailData
    })

    if (response.error) {
      console.error('Booking email error:', response.error)
      throw new Error(`Booking email error: ${response.error.message}`)
    }

    console.log('✅ Booking emails sent successfully:', response.data)
    return { success: true, data: response.data }

  } catch (error) {
    console.error('❌ Failed to send booking emails:', error)
    throw new Error(`Failed to send booking emails: ${error.message}`)
  }
}

// Convenience function for business bookings
export const sendBusinessBookingNotifications = async (bookingData: {
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  sessionType: 'free' | 'paid'
  meetingType: 'online' | 'in-person'
  meetingUrl?: string
  venueAddress?: string
  purpose: string
  isConfirmed: boolean
}) => {
  return await sendBookingEmails({
    clientEmail: {
      to: bookingData.clientEmail,
      name: bookingData.clientName,
      date: bookingData.date,
      time: bookingData.time,
      meetingType: bookingData.meetingType,
      meetingUrl: bookingData.meetingUrl,
      venueAddress: bookingData.venueAddress,
      sessionType: bookingData.sessionType,
      appointmentType: 'business',
      status: bookingData.isConfirmed ? 'confirmed' : 'pending'
    },
    adminEmail: {
      bookingType: 'business',
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      date: bookingData.date,
      time: bookingData.time,
      purpose: bookingData.purpose,
      sessionType: bookingData.sessionType,
      status: bookingData.isConfirmed ? 'confirmed' : 'pending'
    }
  })
}

// Convenience function for student bookings
export const sendStudentBookingNotifications = async (bookingData: {
  clientName: string
  clientEmail: string
  clientPhone: string
  date?: string
  time?: string
  sessionType: 'free' | 'paid'
  appointmentType: 'student' | 'in-person'
  meetingType?: 'online' | 'in-person'
  meetingUrl?: string
  venueAddress?: string
  purpose: string
  isConfirmed: boolean
}) => {
  return await sendBookingEmails({
    clientEmail: {
      to: bookingData.clientEmail,
      name: bookingData.clientName,
      date: bookingData.date,
      time: bookingData.time,
      meetingType: bookingData.meetingType || 'online',
      meetingUrl: bookingData.meetingUrl,
      venueAddress: bookingData.venueAddress,
      sessionType: bookingData.sessionType,
      appointmentType: bookingData.appointmentType,
      status: bookingData.isConfirmed ? 'confirmed' : 'pending'
    },
    adminEmail: {
      bookingType: bookingData.appointmentType,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      date: bookingData.date,
      time: bookingData.time,
      purpose: bookingData.purpose,
      sessionType: bookingData.sessionType,
      status: bookingData.isConfirmed ? 'confirmed' : 'pending'
    }
  })
}

// Cancellation email function
interface CancellationEmailData {
  to: string
  name: string
  date: string
  time: string
  appointmentType: 'business' | 'student' | 'in-person'
  sessionType: 'free' | 'paid'
  reason?: string
  cancelledBy: 'admin' | 'ceo'
}

interface ApprovalEmailData {
  to: string
  name: string
  date: string
  time: string
  appointmentType: 'business' | 'student' | 'in-person'
  sessionType: 'free'
  meetingType: 'online' | 'in-person'
  meetingUrl?: string
  venueAddress?: string
  purpose: string
  status: 'approved' | 'rejected'
  rejectionReason?: string
}

export const sendCancellationEmail = async (data: CancellationEmailData) => {
  try {
    console.log('📧 Sending cancellation email to:', data.to)

    const { supabase } = await import("@/lib/supabase")

    const response = await supabase.functions.invoke('send-booking-email', {
      body: {
        clientEmail: {
          to: data.to,
          name: data.name,
          date: data.date,
          time: data.time,
          appointmentType: data.appointmentType,
          sessionType: data.sessionType,
          status: 'cancelled' as const,
          subject: `Appointment Cancelled - ${new Date(data.date).toLocaleDateString()}`,
          htmlContent: generateCancellationEmailHTML(data)
        }
      }
    })

    if (response.error) {
      console.error('Cancellation email error:', response.error)
      throw new Error(`Cancellation email error: ${response.error.message}`)
    }

    console.log('✅ Cancellation email sent successfully:', response.data)
    return { success: true, data: response.data }

  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error)
    throw new Error(`Failed to send cancellation email: ${error.message}`)
  }
}

const generateCancellationEmailHTML = (data: CancellationEmailData) => {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const sessionTypeText = data.sessionType === 'free' ? 'Free Session' : 'Paid Session'
  const consultationType = data.appointmentType === 'student' ? 'student session' :
                          data.appointmentType === 'business' ? 'business consultation' : 'in-person meeting'

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Cancelled ❌</h2>

      <p>Hi ${data.name},</p>

      <p>We regret to inform you that your ${consultationType} with <strong>Irfan Malik</strong> has been cancelled.</p>

      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">📅 Cancelled Appointment Details</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${data.time} EST</p>
        <p><strong>Type:</strong> ${consultationType} (${sessionTypeText})</p>
        <p style="color: #dc2626; font-weight: bold;">Status: CANCELLED</p>
      </div>

      ${data.reason ? `
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">Reason for Cancellation:</h4>
          <p style="margin: 0; color: #374151;">${data.reason}</p>
        </div>
      ` : ''}

      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2563eb;">📞 Need to Reschedule?</h3>
        <p>We apologize for any inconvenience caused. If you'd like to schedule a new appointment, please visit our booking portal:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://irfanmalik.com'}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
          Book New Appointment →
        </a></p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
          Or contact us directly for assistance with rescheduling.
        </p>
      </div>

      <p>We value your time and understanding. Thank you for your patience.</p>

      <p>Best regards,<br>
      <strong>Irfan Malik</strong><br>
      CEO, Xeven Solutions</p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #6b7280;">
        <p>This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  `
}


// Free session decline email function
export const sendDeclineEmail = async (data: {
  to: string
  name: string
  date: string
  time: string
  appointmentType: 'business' | 'student' | 'in-person'
  sessionType: 'free'
  reason?: string
}) => {
  try {
    console.log('📧 Sending free session decline email to:', data.to)

    const { supabase } = await import("@/lib/supabase")

    const response = await supabase.functions.invoke('send-booking-email', {
      body: {
        clientEmail: {
          to: data.to,
          name: data.name,
          date: data.date,
          time: data.time,
          appointmentType: data.appointmentType,
          sessionType: data.sessionType,
          status: 'declined' as const,
          subject: `Free Session Request - Alternative Options Available`,
          htmlContent: generateDeclineEmailHTML(data),
          reason: data.reason
        }
      }
    })

    if (response.error) {
      console.error('Decline email error:', response.error)
      throw new Error(`Decline email error: ${response.error.message}`)
    }

    console.log('✅ Decline email sent successfully:', response.data)
    return { success: true, data: response.data }

  } catch (error) {
    console.error('❌ Failed to send decline email:', error)
    throw new Error(`Failed to send decline email: ${error.message}`)
  }
}

// Free session approval/rejection email functions
export const sendApprovalEmail = async (data: ApprovalEmailData) => {
  try {
    console.log(`📧 Sending ${data.status} email to:`, data.to)

    const { supabase } = await import("@/lib/supabase")

    if (data.status === 'approved') {
      // Send confirmation email for approved free session
      const response = await supabase.functions.invoke('send-booking-email', {
        body: {
          clientEmail: {
            to: data.to,
            name: data.name,
            date: data.date,
            time: data.time,
            appointmentType: data.appointmentType,
            sessionType: data.sessionType,
            meetingType: data.meetingType,
            meetingUrl: data.meetingUrl,
            venueAddress: data.venueAddress,
            status: 'confirmed' as const,
            subject: `Free Session Approved - ${new Date(data.date).toLocaleDateString()}`,
            htmlContent: generateApprovalEmailHTML(data)
          }
        }
      })

      if (response.error) {
        throw new Error(`Approval email failed: ${response.error.message}`)
      }

      console.log('✅ Approval email sent successfully')
    } else {
      // Send rejection email with guidance
      const response = await supabase.functions.invoke('send-booking-email', {
        body: {
          clientEmail: {
            to: data.to,
            name: data.name,
            date: data.date,
            time: data.time,
            appointmentType: data.appointmentType,
            sessionType: data.sessionType,
            status: 'rejected' as const,
            subject: `Free Session Request - Alternative Options Available`,
            htmlContent: generateRejectionEmailHTML(data)
          }
        }
      })

      if (response.error) {
        throw new Error(`Rejection email failed: ${response.error.message}`)
      }

      console.log('✅ Rejection email sent successfully')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending approval/rejection email:', error)
    throw error
  }
}

// Generate HTML for approval email
const generateApprovalEmailHTML = (data: ApprovalEmailData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 Your Free Session Request Has Been Approved!</h2>

      <p>Dear ${data.name},</p>

      <p>Great news! Irfan Malik has approved your free ${data.appointmentType} session request.</p>

      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">📅 Session Details</h3>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Type:</strong> ${data.meetingType === 'online' ? 'Online Meeting' : 'In-Person Meeting'}</p>
        <p><strong>Purpose:</strong> ${data.purpose}</p>

        ${data.meetingType === 'online' && data.meetingUrl ? `
          <p><strong>Meeting Link:</strong> <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>
        ` : ''}

        ${data.meetingType === 'in-person' && data.venueAddress ? `
          <p><strong>Venue:</strong> ${data.venueAddress}</p>
        ` : ''}
      </div>

      <p>Please mark your calendar and be prepared for an insightful session. If you need to reschedule or have any questions, please contact us as soon as possible.</p>

      <p>Looking forward to connecting with you!</p>

      <p>Best regards,<br>
      <strong>Irfan Malik</strong><br>
      CEO, Xeven Solutions</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
}

// Generate HTML for decline email (different from rejection - used when declining free session requests)
const generateDeclineEmailHTML = (data: {
  name: string
  appointmentType: string
  date: string
  time: string
  reason?: string
}) => {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const consultationType = data.appointmentType === 'student' ? 'student session' :
                          data.appointmentType === 'business' ? 'business consultation' : 'in-person meeting'

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">📋 Free Session Request - Unable to Accommodate</h2>

      <p>Dear ${data.name},</p>

      <p>Thank you for your interest in a free ${consultationType} with <strong>Irfan Malik</strong>.</p>

      <p>Unfortunately, we're unable to accommodate your free session request for <strong>${formattedDate} at ${data.time}</strong>${data.reason ? ` due to: ${data.reason}` : ' at this time'}.</p>

      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">🚫 Request Details</h3>
        <p><strong>Requested Date:</strong> ${formattedDate}</p>
        <p><strong>Requested Time:</strong> ${data.time} EST</p>
        <p><strong>Type:</strong> Free ${consultationType}</p>
        <p style="color: #dc2626; font-weight: bold;">Status: DECLINED</p>
      </div>

      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">🚀 Alternative Options Available</h3>

        <p><strong>1. Paid Consultation Session</strong></p>
        <p>Book a guaranteed consultation session for personalized guidance and immediate scheduling.</p>

        <p><strong>2. Join Our Community</strong></p>
        <p>Follow our social media channels and website for free resources, tips, and occasional open sessions.</p>

        <p><strong>3. Future Free Session Opportunities</strong></p>
        <p>We occasionally offer free group sessions and webinars. Stay tuned to our announcements!</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://irfanmalik.co'}/business"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          📅 Book Paid Session
        </a>
      </div>

      <p>We appreciate your understanding and hope to serve you through one of these alternative pathways.</p>

      <p>Best regards,<br>
      <strong>Irfan Malik</strong><br>
      CEO, Xeven Solutions</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
}

// Generate HTML for rejection email with alternatives
const generateRejectionEmailHTML = (data: ApprovalEmailData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">📋 Free Session Request Update</h2>

      <p>Dear ${data.name},</p>

      <p>Thank you for your interest in a free ${data.appointmentType} session with Irfan Malik.</p>

      <p>Unfortunately, we're unable to accommodate your free session request at this time${data.rejectionReason ? ` due to: ${data.rejectionReason}` : ''}.</p>

      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">🚀 Alternative Options Available</h3>

        <p><strong>1. Paid Consultation Session</strong></p>
        <p>Book a guaranteed consultation session for personalized guidance and immediate scheduling.</p>

        <p><strong>2. Join Our Community</strong></p>
        <p>Follow our social media channels and website for free resources, tips, and occasional open sessions.</p>

        <p><strong>3. Future Opportunities</strong></p>
        <p>We occasionally offer free group sessions and webinars. Stay tuned to our announcements!</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://irfanmalik.co'}/business"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          📅 Book Paid Session
        </a>
      </div>

      <p>We appreciate your understanding and hope to serve you through one of these alternative pathways.</p>

      <p>Best regards,<br>
      <strong>Irfan Malik</strong><br>
      CEO, Xeven Solutions</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
}