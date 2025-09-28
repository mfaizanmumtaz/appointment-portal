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

interface EmailData {
  to: string
  name: string
  date: string
  time: string
  meetingType: 'online' | 'in-person'
  meetingUrl?: string
  venueAddress?: string
  duration?: number
  sessionType?: 'free' | 'paid'
  appointmentType?: 'business' | 'student' | 'in-person'
}

export const sendMeetingEmail = async (data: EmailData) => {
  try {
    console.log('📧 Sending meeting email via Supabase Edge Function to:', data.to)

    const { supabase } = await import("@/lib/supabase")

    const response = await supabase.functions.invoke('send-meeting-email', {
      body: {
        to: data.to,
        subject: `Meeting Confirmed - ${new Date(data.date).toLocaleDateString()}`,
        html: generateEmailHTML(data),
        name: data.name,
        meetingType: data.meetingType
      }
    })

    if (response.error) {
      console.error('Edge Function error:', response.error)
      throw new Error(`Edge Function returned error: ${response.error.message}`)
    }

    console.log('✅ Email sent successfully via Gmail:', response.data)
    return { success: true, message: 'Email sent successfully via Gmail' }

  } catch (error) {
    console.error('❌ Failed to send email:', error)
    // Don't throw - let the calling code handle this gracefully
    throw new Error(`Failed to send email: ${error.message}`)
  }
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

const generateEmailHTML = (data: EmailData) => {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Determine session type display
  const sessionTypeText = data.sessionType === 'free' ? 'Free Session' : 'Paid Session'
  const sessionTypeColor = data.sessionType === 'free' ? '#16a34a' : '#2563eb'
  const consultationType = data.appointmentType === 'student' ? 'student session' : 'business consultation'

  if (data.meetingType === 'online') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${sessionTypeColor};">${sessionTypeText} Confirmed! 🎉</h2>

        <p>Hi ${data.name},</p>

        <p>Your ${consultationType} with <strong>Irfan Malik</strong> has been confirmed!</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📅 Meeting Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${data.time} EST</p>
          <p><strong>Duration:</strong> ${data.duration || 30} minutes</p>
          <p><strong>Type:</strong> Online Video Call</p>
          <p><strong>Session:</strong> <span style="color: ${sessionTypeColor}; font-weight: bold;">${sessionTypeText}</span></p>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🔗 Join Meeting</h3>
          <p><strong>Zoom Link:</strong></p>
          <a href="${data.meetingUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
            ${data.meetingUrl}
          </a>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Click the link 5-10 minutes before the scheduled time.
          </p>
        </div>

        ${data.sessionType === 'free' ?
          '<div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; color: #166534; font-weight: bold;">🎁 This is a complimentary session - no payment required!</p></div>'
          : ''}

        <p>Looking forward to our discussion!</p>

        <p>Best regards,<br>
        <strong>Irfan Malik</strong><br>
        CEO, Xeven Solutions</p>
      </div>
    `
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${sessionTypeColor};">In-Person ${sessionTypeText} Confirmed! 🤝</h2>

        <p>Hi ${data.name},</p>

        <p>Your in-person ${consultationType} with <strong>Irfan Malik</strong> has been confirmed!</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📅 Meeting Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${data.time} EST</p>
          <p><strong>Duration:</strong> ${data.duration || 30} minutes</p>
          <p><strong>Type:</strong> In-Person Meeting</p>
          <p><strong>Session:</strong> <span style="color: ${sessionTypeColor}; font-weight: bold;">${sessionTypeText}</span></p>
        </div>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📍 Venue Address</h3>
          <p style="white-space: pre-line; font-weight: bold;">${data.venueAddress}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Please arrive 5-10 minutes early. Visitor parking is available.
          </p>
        </div>

        ${data.sessionType === 'free' ?
          '<div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; color: #166534; font-weight: bold;">🎁 This is a complimentary session - no payment required!</p></div>'
          : ''}

        <p>Looking forward to meeting you in person!</p>

        <p>Best regards,<br>
        <strong>Irfan Malik</strong><br>
        CEO, Xeven Solutions</p>
      </div>
    `
  }
}